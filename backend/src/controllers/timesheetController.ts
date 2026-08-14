import { Request, Response } from 'express'
import { supabase } from '../lib/supabaseClient'

export const getTimesheets = async (req: Request, res: Response) => {
  try {
    if (!supabase) return res.status(500).json({ error: 'Database not available' })
    
    const { employee_id, project_id, month, year } = req.query
    
    let query = supabase
      .from('timesheets')
      .select(`
        *,
        employees (full_name, employee_code),
        projects (project_name, hourly_rate),
        tasks (title)
      `)
    
    if (employee_id) query = query.eq('employee_id', employee_id)
    if (project_id) query = query.eq('project_id', project_id)
    
    if (month && year) {
      const startDate = `${year}-${String(Number(month) + 1).padStart(2, '0')}-01`
      const endDate = `${year}-${String(Number(month) + 1).padStart(2, '0')}-31`
      query = query.gte('date', startDate).lte('date', endDate)
    }
    
    const { data, error } = await query.order('date', { ascending: false })
    
    if (error) return res.status(400).json({ error: error.message })
    
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const submitTimesheet = async (req: Request, res: Response) => {
  try {
    if (!supabase) return res.status(500).json({ error: 'Database not available' })
    
    const { employee_id, project_id, task_id, date, hours_worked, description, is_billable } = req.body
    
    if (!employee_id || !project_id || !date || !hours_worked) {
      return res.status(400).json({ error: 'employee_id, project_id, date, and hours_worked are required' })
    }
    
    if (hours_worked <= 0 || hours_worked > 24) {
      return res.status(400).json({ error: 'hours_worked must be between 0 and 24' })
    }
    
    const today = new Date().toISOString().split('T')[0]
    if (date > today) {
      return res.status(400).json({ error: 'date cannot be in the future' })
    }
    
    // Check for duplicate
    const { data: existing, error: checkError } = await supabase
      .from('timesheets')
      .select('*')
      .eq('employee_id', employee_id)
      .eq('project_id', project_id)
      .eq('date', date)
      .single()
    
    if (existing) {
      return res.status(409).json({ error: 'Timesheet already exists for this employee, project, and date' })
    }
    
    const { data, error } = await supabase
      .from('timesheets')
      .insert({
        employee_id,
        project_id,
        task_id,
        date,
        hours_worked,
        description,
        is_billable: is_billable !== undefined ? is_billable : true
      })
      .select()
      .single()
    
    if (error) return res.status(400).json({ error: error.message })
    
    // Upsert attendance record
    await supabase
      .from('attendance')
      .upsert({
        employee_id,
        date,
        status: 'present',
        total_hours: hours_worked
      }, { onConflict: 'employee_id,date' })
    
    res.status(201).json(data)
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const updateTimesheet = async (req: Request, res: Response) => {
  try {
    if (!supabase) return res.status(500).json({ error: 'Database not available' })
    
    const { id } = req.params
    const { hours_worked, description, is_billable } = req.body
    
    const updates: any = {}
    if (hours_worked !== undefined) updates.hours_worked = hours_worked
    if (description !== undefined) updates.description = description
    if (is_billable !== undefined) updates.is_billable = is_billable
    
    const { data, error } = await supabase
      .from('timesheets')
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

export const getTimesheetSummary = async (req: Request, res: Response) => {
  try {
    if (!supabase) return res.status(500).json({ error: 'Database not available' })
    
    const { month, year } = req.query
    
    if (!month || !year) {
      return res.status(400).json({ error: 'month and year are required' })
    }
    
    const startDate = `${year}-${String(Number(month) + 1).padStart(2, '0')}-01`
    const endDate = `${year}-${String(Number(month) + 1).padStart(2, '0')}-31`
    
    const { data: timesheets, error } = await supabase
      .from('timesheets')
      .select(`
        *,
        employees (full_name),
        projects (project_name)
      `)
      .gte('date', startDate)
      .lte('date', endDate)
    
    if (error) return res.status(400).json({ error: error.message })
    
    // Group by employee
    const employeeSummary: any = {}
    const projectSummary: any = {}
    
    timesheets?.forEach((ts: any) => {
      const empId = ts.employee_id
      const empName = ts.employees?.full_name || 'Unknown'
      const projId = ts.project_id
      const projName = ts.projects?.project_name || 'Unknown'
      const hours = Number(ts.hours_worked)
      const billable = ts.is_billable ? hours : 0
      
      if (!employeeSummary[empId]) {
        employeeSummary[empId] = {
          employee_id: empId,
          employee_name: empName,
          total_hours: 0,
          billable_hours: 0,
          projects_count: new Set()
        }
      }
      employeeSummary[empId].total_hours += hours
      employeeSummary[empId].billable_hours += billable
      employeeSummary[empId].projects_count.add(projId)
      
      if (!projectSummary[projId]) {
        projectSummary[projId] = {
          project_id: projId,
          project_name: projName,
          total_hours: 0,
          billable_hours: 0
        }
      }
      projectSummary[projId].total_hours += hours
      projectSummary[projId].billable_hours += billable
    })
    
    const employeeArray = Object.values(employeeSummary).map((e: any) => ({
      ...e,
      projects_count: e.projects_count.size
    }))
    
    const projectArray = Object.values(projectSummary)
    
    res.json({
      by_employee: employeeArray,
      by_project: projectArray
    })
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
}
