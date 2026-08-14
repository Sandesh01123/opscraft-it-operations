import { Request, Response } from 'express'
import { supabase } from '../lib/supabaseClient'

export const getLeaves = async (req: Request, res: Response) => {
  try {
    if (!supabase) return res.status(500).json({ error: 'Database not available' })
    
    const { employee_id, status, month, year } = req.query
    
    let query = supabase
      .from('leaves')
      .select(`
        *,
        employees (full_name, employee_code, designation)
      `)
    
    if (employee_id) query = query.eq('employee_id', employee_id)
    if (status) query = query.eq('status', status)
    
    if (month && year) {
      const startDate = `${year}-${String(Number(month) + 1).padStart(2, '0')}-01`
      const endDate = `${year}-${String(Number(month) + 1).padStart(2, '0')}-31`
      query = query.gte('from_date', startDate).lte('to_date', endDate)
    }
    
    const { data, error } = await query.order('created_at', { ascending: false })
    
    if (error) return res.status(400).json({ error: error.message })
    
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const applyLeave = async (req: Request, res: Response) => {
  try {
    if (!supabase) return res.status(500).json({ error: 'Database not available' })
    
    const { employee_id, leave_type, from_date, to_date, reason } = req.body
    
    if (!employee_id || !leave_type || !from_date || !to_date) {
      return res.status(400).json({ error: 'employee_id, leave_type, from_date, and to_date are required' })
    }
    
    const validLeaveTypes = ['CL', 'SL', 'EL', 'LOP']
    if (!validLeaveTypes.includes(leave_type)) {
      return res.status(400).json({ error: 'Invalid leave_type. Must be CL, SL, EL, or LOP' })
    }
    
    const today = new Date().toISOString().split('T')[0]
    if (from_date < today) {
      return res.status(400).json({ error: 'from_date cannot be in the past' })
    }
    
    if (to_date < from_date) {
      return res.status(400).json({ error: 'to_date must be after or equal to from_date' })
    }
    
    // Calculate total days (weekdays only)
    const fromDate = new Date(from_date)
    const toDate = new Date(to_date)
    let totalDays = 0
    let currentDate = new Date(fromDate)
    
    while (currentDate <= toDate) {
      const dayOfWeek = currentDate.getDay()
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
        totalDays++
      }
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    // Check leave balance for CL, SL, EL
    if (leave_type !== 'LOP') {
      const currentYear = new Date().getFullYear()
      const { data: balance, error: balanceError } = await supabase
        .from('leave_balances')
        .select('*')
        .eq('employee_id', employee_id)
        .eq('year', currentYear)
        .single()
      
      if (balanceError || !balance) {
        return res.status(400).json({ error: 'Leave balance not found' })
      }
      
      if (leave_type === 'CL' && balance.casual_leave_used + totalDays > balance.casual_leave_total) {
        return res.status(400).json({ error: 'Insufficient CL balance' })
      }
      
      if (leave_type === 'SL' && balance.sick_leave_used + totalDays > balance.sick_leave_total) {
        return res.status(400).json({ error: 'Insufficient SL balance' })
      }
      
      if (leave_type === 'EL' && balance.earned_leave_used + totalDays > balance.earned_leave_total) {
        return res.status(400).json({ error: 'Insufficient EL balance' })
      }
    }
    
    const { data, error } = await supabase
      .from('leaves')
      .insert({
        employee_id,
        leave_type,
        from_date,
        to_date,
        total_days: totalDays,
        reason,
        status: 'pending'
      })
      .select()
      .single()
    
    if (error) return res.status(400).json({ error: error.message })
    
    res.status(201).json(data)
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const approveLeave = async (req: Request, res: Response) => {
  try {
    if (!supabase) return res.status(500).json({ error: 'Database not available' })
    
    const { id } = req.params
    const { approved_by } = req.body
    
    // Get leave details
    const { data: leave, error: leaveError } = await supabase
      .from('leaves')
      .select('*')
      .eq('id', id)
      .single()
    
    if (leaveError || !leave) {
      return res.status(404).json({ error: 'Leave request not found' })
    }
    
    // Update leave status
    const { data: updatedLeave, error: updateError } = await supabase
      .from('leaves')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by
      })
      .eq('id', id)
      .select()
      .single()
    
    if (updateError) return res.status(400).json({ error: updateError.message })
    
    // Update leave balance
    const currentYear = new Date().getFullYear()
    const { data: balance } = await supabase
      .from('leave_balances')
      .select('*')
      .eq('employee_id', leave.employee_id)
      .eq('year', currentYear)
      .single()
    
    if (balance) {
      const updateData: any = {}
      
      if (leave.leave_type === 'CL') {
        updateData.casual_leave_used = balance.casual_leave_used + leave.total_days
      } else if (leave.leave_type === 'SL') {
        updateData.sick_leave_used = balance.sick_leave_used + leave.total_days
      } else if (leave.leave_type === 'EL') {
        updateData.earned_leave_used = balance.earned_leave_used + leave.total_days
      }
      
      if (Object.keys(updateData).length > 0) {
        await supabase
          .from('leave_balances')
          .update(updateData)
          .eq('id', balance.id)
      }
    }
    
    res.json(updatedLeave)
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const rejectLeave = async (req: Request, res: Response) => {
  try {
    if (!supabase) return res.status(500).json({ error: 'Database not available' })
    
    const { id } = req.params
    const { rejection_reason } = req.body
    
    const { data, error } = await supabase
      .from('leaves')
      .update({
        status: 'rejected',
        rejection_reason
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) return res.status(400).json({ error: error.message })
    
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const getLeaveBalances = async (req: Request, res: Response) => {
  try {
    if (!supabase) return res.status(500).json({ error: 'Database not available' })
    
    const { employee_id } = req.params
    const currentYear = new Date().getFullYear()
    
    const { data, error } = await supabase
      .from('leave_balances')
      .select('*')
      .eq('employee_id', employee_id)
      .eq('year', currentYear)
      .single()
    
    if (error) return res.status(404).json({ error: 'Leave balance not found' })
    
    // Calculate remaining
    const result = {
      ...data,
      cl_remaining: data.casual_leave_total - data.casual_leave_used,
      sl_remaining: data.sick_leave_total - data.sick_leave_used,
      el_remaining: data.earned_leave_total - data.earned_leave_used
    }
    
    res.json(result)
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const getAllLeaveBalances = async (req: Request, res: Response) => {
  try {
    if (!supabase) return res.status(500).json({ error: 'Database not available' })
    
    const currentYear = new Date().getFullYear()
    
    const { data, error } = await supabase
      .from('leave_balances')
      .select('*, employees(full_name, employee_code, designation)')
      .eq('year', currentYear)
      .order('created_at', { ascending: true })
    
    if (error) return res.status(500).json({ error: error.message })
    
    const result = (data || []).map((balance: any) => ({
      ...balance,
      cl_remaining: balance.casual_leave_total - balance.casual_leave_used,
      sl_remaining: balance.sick_leave_total - balance.sick_leave_used,
      el_remaining: balance.earned_leave_total - balance.earned_leave_used
    }))
    
    res.json({ success: true, data: result })
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch leave balances', details: error.message })
  }
}
