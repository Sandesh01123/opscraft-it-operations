import { Request, Response } from 'express'
import { supabase } from '../lib/supabaseClient'

export const getProjects = async (req: Request, res: Response) => {
  try {
    if (!supabase) return res.status(500).json({ error: 'Database not available' })
    
    const { status, client_id } = req.query
    
    let query = supabase
      .from('projects')
      .select(`
        *,
        clients (company_name, city, state),
        project_manager:employees (full_name),
        tasks (count)
      `)
    
    if (status) query = query.eq('status', status)
    if (client_id) query = query.eq('client_id', client_id)
    
    const { data, error } = await query.order('created_at', { ascending: false })
    
    if (error) return res.status(400).json({ error: error.message })
    
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const createProject = async (req: Request, res: Response) => {
  try {
    if (!supabase) return res.status(500).json({ error: 'Database not available' })
    
    const { project_name, client_id, hourly_rate, start_date, end_date, priority, description, project_manager_id } = req.body
    
    if (!project_name || !hourly_rate) {
      return res.status(400).json({ error: 'project_name and hourly_rate are required' })
    }
    
    const project_code = 'PROJ' + Date.now().toString().slice(-6)
    
    const { data, error } = await supabase
      .from('projects')
      .insert({
        project_code,
        project_name,
        client_id,
        hourly_rate,
        start_date,
        end_date,
        priority,
        description,
        project_manager_id
      })
      .select()
      .single()
    
    if (error) return res.status(400).json({ error: error.message })
    
    res.status(201).json(data)
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const updateProject = async (req: Request, res: Response) => {
  try {
    if (!supabase) return res.status(500).json({ error: 'Database not available' })
    
    const { id } = req.params
    const updates = req.body
    
    const { data, error } = await supabase
      .from('projects')
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

export const deleteProject = async (req: Request, res: Response) => {
  try {
    if (!supabase) return res.status(500).json({ error: 'Database not available' })
    
    const { id } = req.params
    
    const { error } = await supabase.from('projects').delete().eq('id', id)
    
    if (error) return res.status(400).json({ error: error.message })
    
    res.status(200).json({ message: 'Project deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const getProjectStats = async (req: Request, res: Response) => {
  try {
    if (!supabase) return res.status(500).json({ error: 'Database not available' })
    
    const { id } = req.params
    
    // Total hours
    const { data: hoursData, error: hoursError } = await supabase
      .from('timesheets')
      .select('hours_worked')
      .eq('project_id', id)
    
    const totalHours = hoursData?.reduce((sum, t) => sum + Number(t.hours_worked), 0) || 0
    
    // Billable hours
    const { data: billableData, error: billableError } = await supabase
      .from('timesheets')
      .select('hours_worked')
      .eq('project_id', id)
      .eq('is_billable', true)
    
    const billableHours = billableData?.reduce((sum, t) => sum + Number(t.hours_worked), 0) || 0
    
    // Total tasks
    const { count: totalTasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', id)
    
    // Completed tasks
    const { count: completedTasks, error: completedError } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', id)
      .eq('status', 'done')
    
    // Total invoiced
    const { data: invoiceData, error: invoiceError } = await supabase
      .from('invoices')
      .select('total_amount')
      .eq('project_id', id)
    
    const totalInvoiced = invoiceData?.reduce((sum, i) => sum + Number(i.total_amount), 0) || 0
    
    res.json({
      total_hours: totalHours,
      billable_hours: billableHours,
      total_tasks: totalTasks || 0,
      completed_tasks: completedTasks || 0,
      total_invoiced: totalInvoiced
    })
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
}
