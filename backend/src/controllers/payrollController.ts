import { Request, Response } from 'express'
import { supabase } from '../lib/supabaseClient'
import { calculatePayroll } from '../services/payrollCalculator'

export const getPayroll = async (req: Request, res: Response) => {
  try {
    if (!supabase) return res.status(500).json({ error: 'Database not available' })
    
    const { month, year, employee_id } = req.query
    
    if (!month || !year) {
      return res.status(400).json({ error: 'month and year are required' })
    }
    
    let query = supabase
      .from('payroll')
      .select(`
        *,
        employees (full_name, employee_code, designation, department)
      `)
      .eq('month', month)
      .eq('year', year)
    
    if (employee_id) query = query.eq('employee_id', employee_id)
    
    const { data, error } = await query.order('employees(full_name)', { ascending: true })
    
    if (error) return res.status(400).json({ error: error.message })
    
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const processPayroll = async (req: Request, res: Response) => {
  try {
    if (!supabase) return res.status(500).json({ error: 'Database not available' })
    
    const { month, year, working_days } = req.body
    
    if (!month || !year || !working_days) {
      return res.status(400).json({ error: 'month, year, and working_days are required' })
    }
    
    // Fetch all active employees
    const { data: employees, error: empError } = await supabase
      .from('employees')
      .select('*')
      .eq('status', 'active')
    
    if (empError) return res.status(400).json({ error: empError.message })
    
    let processedCount = 0
    let skippedCount = 0
    const results: any[] = []
    
    for (const employee of employees || []) {
      // Check if payroll already exists
      const { data: existing } = await supabase
        .from('payroll')
        .select('*')
        .eq('employee_id', employee.id)
        .eq('month', month)
        .eq('year', year)
        .single()
      
      if (existing && existing.status === 'processed') {
        skippedCount++
        continue
      }
      
      // Count days present from attendance
      const startDate = `${year}-${String(Number(month) + 1).padStart(2, '0')}-01`
      const endDate = `${year}-${String(Number(month) + 1).padStart(2, '0')}-31`
      
      const { count: daysPresent } = await supabase
        .from('attendance')
        .select('*', { count: 'exact', head: true })
        .eq('employee_id', employee.id)
        .eq('status', 'present')
        .gte('date', startDate)
        .lte('date', endDate)
      
      // Count LOP days from approved leaves
      const { data: lopLeaves } = await supabase
        .from('leaves')
        .select('total_days')
        .eq('employee_id', employee.id)
        .eq('leave_type', 'LOP')
        .eq('status', 'approved')
        .gte('from_date', startDate)
        .lte('to_date', endDate)
      
      const lopDays = lopLeaves?.reduce((sum, leave) => sum + Number(leave.total_days), 0) || 0
      
      const finalDaysPresent = (daysPresent || 0) - lopDays
      
      // Calculate payroll
      const payrollResult = calculatePayroll(
        {
          gross_salary: Number(employee.gross_salary),
          basic_salary: Number(employee.basic_salary),
          hra: Number(employee.hra),
          special_allowance: Number(employee.special_allowance)
        },
        working_days,
        finalDaysPresent
      )
      
      // Upsert payroll
      const { data: payroll, error: payrollError } = await supabase
        .from('payroll')
        .upsert({
          employee_id: employee.id,
          month,
          year,
          working_days,
          days_present: finalDaysPresent,
          days_lop: lopDays,
          gross_salary: payrollResult.gross_salary,
          basic_salary: payrollResult.basic_salary,
          hra: payrollResult.hra,
          special_allowance: payrollResult.special_allowance,
          pf_employee: payrollResult.pf_employee,
          pf_employer: payrollResult.pf_employer,
          esi_employee: payrollResult.esi_employee,
          esi_employer: payrollResult.esi_employer,
          professional_tax: payrollResult.professional_tax,
          tds: payrollResult.tds,
          lop_deduction: payrollResult.lop_deduction,
          total_deductions: payrollResult.total_deductions,
          net_salary: payrollResult.net_salary,
          status: 'draft'
        }, { onConflict: 'employee_id,month,year' })
        .select()
        .single()
      
      if (payrollError) {
        console.error(`Error processing payroll for ${employee.full_name}:`, payrollError)
        continue
      }
      
      processedCount++
      results.push(payroll)
    }
    
    res.json({
      processed: processedCount,
      skipped: skippedCount,
      total: employees?.length || 0,
      results
    })
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const processOneEmployee = async (req: Request, res: Response) => {
  try {
    if (!supabase) return res.status(500).json({ error: 'Database not available' })
    
    const { employee_id, month, year, working_days, days_present } = req.body
    
    if (!employee_id || !month || !year || !working_days || days_present === undefined) {
      return res.status(400).json({ error: 'employee_id, month, year, working_days, and days_present are required' })
    }
    
    // Fetch employee
    const { data: employee, error: empError } = await supabase
      .from('employees')
      .select('*')
      .eq('id', employee_id)
      .single()
    
    if (empError || !employee) {
      return res.status(404).json({ error: 'Employee not found' })
    }
    
    // Calculate payroll
    const payrollResult = calculatePayroll(
      {
        gross_salary: Number(employee.gross_salary),
        basic_salary: Number(employee.basic_salary),
        hra: Number(employee.hra),
        special_allowance: Number(employee.special_allowance)
      },
      working_days,
      days_present
    )
    
    // Upsert payroll
    const { data, error } = await supabase
      .from('payroll')
      .upsert({
        employee_id,
        month,
        year,
        working_days,
        days_present,
        days_lop: working_days - days_present,
        gross_salary: payrollResult.gross_salary,
        basic_salary: payrollResult.basic_salary,
        hra: payrollResult.hra,
        special_allowance: payrollResult.special_allowance,
        pf_employee: payrollResult.pf_employee,
        pf_employer: payrollResult.pf_employer,
        esi_employee: payrollResult.esi_employee,
        esi_employer: payrollResult.esi_employer,
        professional_tax: payrollResult.professional_tax,
        tds: payrollResult.tds,
        lop_deduction: payrollResult.lop_deduction,
        total_deductions: payrollResult.total_deductions,
        net_salary: payrollResult.net_salary,
        status: 'draft'
      }, { onConflict: 'employee_id,month,year' })
      .select()
      .single()
    
    if (error) return res.status(400).json({ error: error.message })
    
    res.status(201).json(data)
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const finalizePayroll = async (req: Request, res: Response) => {
  try {
    if (!supabase) return res.status(500).json({ error: 'Database not available' })
    
    const { month, year } = req.body
    
    if (!month || !year) {
      return res.status(400).json({ error: 'month and year are required' })
    }
    
    const { data, error } = await supabase
      .from('payroll')
      .update({
        status: 'processed',
        processed_at: new Date().toISOString()
      })
      .eq('month', month)
      .eq('year', year)
      .eq('status', 'draft')
      .select()
    
    if (error) return res.status(400).json({ error: error.message })
    
    res.json({
      updated: data?.length || 0,
      data
    })
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const getPayslip = async (req: Request, res: Response) => {
  try {
    if (!supabase) return res.status(500).json({ error: 'Database not available' })
    
    const { employee_id } = req.params
    const { month, year } = req.query
    
    if (!month || !year) {
      return res.status(400).json({ error: 'month and year are required' })
    }
    
    // Fetch payroll with employee
    const { data: payroll, error: payrollError } = await supabase
      .from('payroll')
      .select(`
        *,
        employees (*)
      `)
      .eq('employee_id', employee_id)
      .eq('month', month)
      .eq('year', year)
      .single()
    
    if (payrollError || !payroll) {
      return res.status(404).json({ error: 'Payslip not found' })
    }
    
    // Fetch company config
    const { data: company } = await supabase
      .from('company_config')
      .select('*')
      .single()
    
    res.json({
      payroll,
      company
    })
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
}
