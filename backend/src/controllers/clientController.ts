import { Request, Response } from 'express'
import { supabase } from '../lib/supabaseClient'

export const getClients = async (req: Request, res: Response) => {
  try {
    if (!supabase) return res.status(500).json({ error: 'Database not available' })
    
    const { status, search } = req.query
    
    let query = supabase
      .from('clients')
      .select(`
        *,
        projects (count)
      `)
    
    if (status) query = query.eq('status', status)
    if (search) query = query.ilike('company_name', `%${search}%`)
    
    const { data, error } = await query.order('created_at', { ascending: false })
    
    if (error) return res.status(400).json({ error: error.message })
    
    // For each client, get active projects count and total invoiced
    const clientsWithStats = await Promise.all(
      data.map(async (client: any) => {
        const [{ count: activeProjects }, { data: invoices }] = await Promise.all([
          supabase!
            .from('projects')
            .select('*', { count: 'exact', head: true })
            .eq('client_id', client.id)
            .eq('status', 'active'),
          supabase!
            .from('invoices')
            .select('total_amount')
            .eq('client_id', client.id)
        ])
        
        const totalInvoiced = invoices?.reduce((sum, inv) => sum + Number(inv.total_amount), 0) || 0
        
        return {
          ...client,
          active_projects: activeProjects || 0,
          total_invoiced: totalInvoiced
        }
      })
    )
    
    res.json(clientsWithStats)
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const createClient = async (req: Request, res: Response) => {
  try {
    if (!supabase) return res.status(500).json({ error: 'Database not available' })
    
    const { company_name, contact_name, email, phone, gstin, pan, billing_address, city, state, pincode } = req.body
    
    if (!company_name) {
      return res.status(400).json({ error: 'company_name is required' })
    }
    
    const is_same_state = state === 'Karnataka'
    
    const { data, error } = await supabase
      .from('clients')
      .insert({
        company_name,
        contact_name,
        email,
        phone,
        gstin,
        pan,
        billing_address,
        city,
        state,
        pincode,
        is_same_state
      })
      .select()
      .single()
    
    if (error) return res.status(400).json({ error: error.message })
    
    res.status(201).json(data)
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const getClientById = async (req: Request, res: Response) => {
  try {
    if (!supabase) return res.status(500).json({ error: 'Database not available' })
    
    const { id } = req.params
    
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) return res.status(404).json({ error: 'Client not found' })
    
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const updateClient = async (req: Request, res: Response) => {
  try {
    if (!supabase) return res.status(500).json({ error: 'Database not available' })
    
    const { id } = req.params
    const updates = req.body
    
    // Auto-update is_same_state if state changes
    if (updates.state) {
      updates.is_same_state = updates.state === 'Karnataka'
    }
    
    const { data, error } = await supabase
      .from('clients')
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
