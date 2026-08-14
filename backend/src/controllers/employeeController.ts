import { Request, Response } from 'express'
import { supabase } from '../lib/supabaseClient'

export const getEmployees = async (req: Request, res: Response) => {
  try {
    if (!supabase) return res.status(500).json({ error: 'Database not available' })
    
    const { status, department, search } = req.query
    
    let query = supabase.from('employees').select('*')
    
    if (status) query = query.eq('status', status)
    if (department) query = query.eq('department', department)
    if (search) query = query.ilike('full_name', `%${search}%`)
    
    const { data, error } = await query.order('full_name', { ascending: true })
    
    if (error) return res.status(400).json({ error: error.message })
    
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const createEmployee = async (req: Request, res: Response) => {
  try {
    if (!supabase) return res.status(500).json({ error: 'Database not available' })
    
    const {
      full_name, email, phone, designation, department, date_of_joining,
      date_of_birth, pan, aadhar, pf_number, esi_number,
      bank_name, account_number, ifsc_code,
      gross_salary, basic_salary, hra, special_allowance,
      employment_type, employee_code
    } = req.body
    
    if (!full_name || !email || !date_of_joining || !gross_salary || !basic_salary) {
      return res.status(400).json({ error: 'full_name, email, date_of_joining, gross_salary, and basic_salary are required' })
    }
    
    // Auto-generate employee code if not provided
    let finalEmployeeCode = employee_code
    if (!finalEmployeeCode) {
      const { count } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
      
      const nextNum = (count || 0) + 1
      finalEmployeeCode = 'EMP' + nextNum.toString().padStart(3, '0')
    }
    
    const { data, error } = await supabase
      .from('employees')
      .insert({
        employee_code: finalEmployeeCode,
        full_name,
        email,
        phone,
        designation,
        department,
        date_of_joining,
        date_of_birth,
        pan,
        aadhar,
        pf_number,
        esi_number,
        bank_name,
        account_number,
        ifsc_code,
        gross_salary,
        basic_salary,
        hra,
        special_allowance,
        employment_type: employment_type || 'full_time'
      })
      .select()
      .single()
    
    if (error) return res.status(400).json({ error: error.message })
    
    // Create leave balance for current year
    const currentYear = new Date().getFullYear()
    await supabase
      .from('leave_balances')
      .insert({
        employee_id: data.id,
        year: currentYear,
        casual_leave_total: 12,
        sick_leave_total: 12,
        earned_leave_total: 15
      })
    
    res.status(201).json(data)
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const getEmployeeById = async (req: Request, res: Response) => {
  try {
    if (!supabase) return res.status(500).json({ error: 'Database not available' })
    
    const { id } = req.params
    
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) return res.status(404).json({ error: 'Employee not found' })
    
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const updateEmployee = async (req: Request, res: Response) => {
  try {
    if (!supabase) return res.status(500).json({ error: 'Database not available' })
    
    const { id } = req.params
    const updates = req.body
    
    const { data, error } = await supabase
      .from('employees')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) return res.status(400).json({ error: error.message })
    
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const getEmployeeDashboard = async (req: Request, res: Response) => {
  try {
    if (!supabase) return res.status(500).json({ error: 'Database not available' })
    
    const { id } = req.params
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth()
    
    // Leave balances
    const { data: leaveBalances } = await supabase
      .from('leave_balances')
      .select('*')
      .eq('employee_id', id)
      .eq('year', currentYear)
      .single()
    
    // Timesheets this month
    const startDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`
    const endDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-31`
    
    const { data: timesheets } = await supabase
      .from('timesheets')
      .select('hours_worked')
      .eq('employee_id', id)
      .gte('date', startDate)
      .lte('date', endDate)
    
    const totalHours = timesheets?.reduce((sum, ts) => sum + Number(ts.hours_worked), 0) || 0
    
    // Current tasks
    const { data: tasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('assigned_to', id)
      .neq('status', 'done')
    
    // Last payslip
    const { data: payslip } = await supabase
      .from('payroll')
      .select('*')
      .eq('employee_id', id)
      .eq('status', 'processed')
      .order('year', { ascending: false })
      .order('month', { ascending: false })
      .limit(1)
      .single()
    
    res.json({
      leave_balances: leaveBalances,
      timesheets_this_month: { total_hours: totalHours },
      current_tasks: tasks || [],
      last_payslip: payslip
    })
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
}
