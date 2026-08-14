import { Request, Response } from 'express'
import { supabase } from '../lib/supabaseClient'

export const getTasks = async (req: Request, res: Response) => {
  try {
    if (!supabase) return res.status(500).json({ error: 'Database not available' })
    
    const { project_id, status, assigned_to } = req.query
    
    if (!project_id) {
      return res.status(400).json({ error: 'project_id is required' })
    }
    
    let query = supabase
      .from('tasks')
      .select(`
        *,
        assigned_employee:employees (full_name, designation)
      `)
      .eq('project_id', project_id)
    
    if (status) query = query.eq('status', status)
    if (assigned_to) query = query.eq('assigned_to', assigned_to)
    
    const { data, error } = await query.order('priority', { ascending: false }).order('due_date', { ascending: true })
    
    if (error) return res.status(400).json({ error: error.message })
    
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const createTask = async (req: Request, res: Response) => {
  try {
    if (!supabase) return res.status(500).json({ error: 'Database not available' })
    
    const { project_id, title, description, assigned_to, priority, due_date, estimated_hours } = req.body
    
    if (!project_id || !title) {
      return res.status(400).json({ error: 'project_id and title are required' })
    }
    
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        project_id,
        title,
        description,
        assigned_to,
        priority,
        due_date,
        estimated_hours
      })
      .select()
      .single()
    
    if (error) return res.status(400).json({ error: error.message })
    
    res.status(201).json(data)
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const updateTask = async (req: Request, res: Response) => {
  try {
    if (!supabase) return res.status(500).json({ error: 'Database not available' })
    
    const { id } = req.params
    const { title, description, status, priority, due_date, assigned_to, estimated_hours, actual_hours } = req.body
    
    const updates: any = {}
    if (title !== undefined) updates.title = title
    if (description !== undefined) updates.description = description
    if (status !== undefined) updates.status = status
    if (priority !== undefined) updates.priority = priority
    if (due_date !== undefined) updates.due_date = due_date
    if (assigned_to !== undefined) updates.assigned_to = assigned_to
    if (estimated_hours !== undefined) updates.estimated_hours = estimated_hours
    if (actual_hours !== undefined) updates.actual_hours = actual_hours
    
    const { data, error } = await supabase
      .from('tasks')
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

export const deleteTask = async (req: Request, res: Response) => {
  try {
    if (!supabase) return res.status(500).json({ error: 'Database not available' })
    
    const { id } = req.params
    
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    
    if (error) return res.status(400).json({ error: error.message })
    
    res.status(200).json({ message: 'Task deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
}
