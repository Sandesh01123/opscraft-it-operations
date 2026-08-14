import { Request, Response } from 'express'
import { supabase } from '../lib/supabaseClient'
import { calculateGST, generateInvoiceNumber } from '../services/gstCalculator'

export const getInvoices = async (req: Request, res: Response) => {
  try {
    if (!supabase) return res.status(500).json({ error: 'Database not available' })
    
    const { client_id, status, month, year } = req.query
    
    let query = supabase
      .from('invoices')
      .select(`
        *,
        clients (company_name, gstin, billing_address, city, state),
        projects (project_name),
        invoice_line_items (*)
      `)
    
    if (client_id) query = query.eq('client_id', client_id)
    if (status) query = query.eq('status', status)
    
    if (month && year) {
      const startDate = `${year}-${String(Number(month) + 1).padStart(2, '0')}-01`
      const endDate = `${year}-${String(Number(month) + 1).padStart(2, '0')}-31`
      query = query.gte('invoice_date', startDate).lte('invoice_date', endDate)
    }
    
    const { data, error } = await query.order('invoice_date', { ascending: false })
    
    if (error) return res.status(400).json({ error: error.message })
    
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const createInvoice = async (req: Request, res: Response) => {
  try {
    if (!supabase) return res.status(500).json({ error: 'Database not available' })
    
    const { client_id, project_id, due_date, billing_period_start, billing_period_end, line_items, notes } = req.body
    
    if (!client_id || !line_items || !line_items.length || !due_date) {
      return res.status(400).json({ error: 'client_id, line_items, and due_date are required' })
    }
    
    // Fetch client to get is_same_state
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('is_same_state')
      .eq('id', client_id)
      .single()
    
    if (clientError || !client) {
      return res.status(404).json({ error: 'Client not found' })
    }
    
    // Generate invoice number
    const invoice_number = generateInvoiceNumber()
    
    // Calculate subtotal
    const subtotal = line_items.reduce((sum: number, item: any) => {
      return sum + (item.quantity * item.rate)
    }, 0)
    
    // Calculate GST
    const isSameState = client.is_same_state ?? true
    const gstResult = calculateGST(subtotal, isSameState)
    
    // Insert invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        invoice_number,
        client_id,
        project_id,
        due_date,
        billing_period_start,
        billing_period_end,
        subtotal,
        cgst_rate: gstResult.cgst_rate,
        sgst_rate: gstResult.sgst_rate,
        igst_rate: gstResult.igst_rate,
        cgst_amount: gstResult.cgst_amount,
        sgst_amount: gstResult.sgst_amount,
        igst_amount: gstResult.igst_amount,
        total_amount: gstResult.total_amount,
        notes
      })
      .select()
      .single()
    
    if (invoiceError) return res.status(400).json({ error: invoiceError.message })
    
    // Insert line items
    const lineItemsToInsert = line_items.map((item: any) => ({
      invoice_id: invoice.id,
      description: item.description,
      hsn_sac_code: item.hsn_sac_code || '998314',
      quantity: item.quantity,
      unit: item.unit || 'Hours',
      rate: item.rate,
      amount: item.quantity * item.rate
    }))
    
    const { error: lineItemsError } = await supabase
      .from('invoice_line_items')
      .insert(lineItemsToInsert)
    
    if (lineItemsError) return res.status(400).json({ error: lineItemsError.message })
    
    // Fetch complete invoice with line items
    const { data: completeInvoice, error: fetchError } = await supabase
      .from('invoices')
      .select(`
        *,
        clients (company_name, gstin, billing_address, city, state),
        projects (project_name),
        invoice_line_items (*)
      `)
      .eq('id', invoice.id)
      .single()
    
    if (fetchError) return res.status(400).json({ error: fetchError.message })
    
    res.status(201).json(completeInvoice)
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const markInvoicePaid = async (req: Request, res: Response) => {
  try {
    if (!supabase) return res.status(500).json({ error: 'Database not available' })
    
    const { id } = req.params
    const { payment_date, payment_reference } = req.body
    
    const { data, error } = await supabase
      .from('invoices')
      .update({
        status: 'paid',
        payment_date,
        payment_reference
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

export const generateInvoiceFromTimesheets = async (req: Request, res: Response) => {
  try {
    if (!supabase) return res.status(500).json({ error: 'Database not available' })
    
    const { client_id, project_id, month, year } = req.body
    
    if (!client_id || !project_id || !month || !year) {
      return res.status(400).json({ error: 'client_id, project_id, month, and year are required' })
    }
    
    // Fetch client
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', client_id)
      .single()
    
    if (clientError || !client) {
      return res.status(404).json({ error: 'Client not found' })
    }
    
    // Fetch project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', project_id)
      .single()
    
    if (projectError || !project) {
      return res.status(404).json({ error: 'Project not found' })
    }
    
    // Fetch billable timesheets for the month
    const startDate = `${year}-${String(Number(month) + 1).padStart(2, '0')}-01`
    const endDate = `${year}-${String(Number(month) + 1).padStart(2, '0')}-31`
    
    const { data: timesheets, error: timesheetsError } = await supabase
      .from('timesheets')
      .select(`
        *,
        employees (full_name, designation)
      `)
      .eq('project_id', project_id)
      .eq('is_billable', true)
      .gte('date', startDate)
      .lte('date', endDate)
    
    if (timesheetsError) return res.status(400).json({ error: timesheetsError.message })
    
    if (!timesheets || timesheets.length === 0) {
      return res.status(404).json({ error: 'No billable timesheets found for this project and period' })
    }
    
    // Group timesheets by employee
    const employeeGroups: any = {}
    timesheets?.forEach((ts: any) => {
      const empId = ts.employee_id
      if (!employeeGroups[empId]) {
        employeeGroups[empId] = {
          employee_name: ts.employees?.full_name,
          designation: ts.employees?.designation,
          total_hours: 0
        }
      }
      employeeGroups[empId].total_hours += Number(ts.hours_worked)
    })
    
    // Create line items
    const line_items = Object.values(employeeGroups).map((group: any) => ({
      description: `${group.employee_name} - ${group.designation} (${group.total_hours} hrs)`,
      hsn_sac_code: '998314',
      quantity: group.total_hours,
      unit: 'Hours',
      rate: project.hourly_rate
    }))
    
    // Create invoice
    const due_date = new Date()
    due_date.setDate(due_date.getDate() + 30)
    
    const invoiceData = {
      client_id,
      project_id,
      due_date: due_date.toISOString().split('T')[0],
      billing_period_start: startDate,
      billing_period_end: endDate,
      line_items
    }
    
    // Use createInvoice logic
    const invoice_number = generateInvoiceNumber()
    const subtotal = line_items.reduce((sum: number, item: any) => sum + (item.quantity * item.rate), 0)
    const isSameState = client.is_same_state ?? true
    const gstResult = calculateGST(subtotal, isSameState)
    
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        invoice_number,
        client_id,
        project_id,
        due_date: invoiceData.due_date,
        billing_period_start: invoiceData.billing_period_start,
        billing_period_end: invoiceData.billing_period_end,
        subtotal,
        cgst_rate: gstResult.cgst_rate,
        sgst_rate: gstResult.sgst_rate,
        igst_rate: gstResult.igst_rate,
        cgst_amount: gstResult.cgst_amount,
        sgst_amount: gstResult.sgst_amount,
        igst_amount: gstResult.igst_amount,
        total_amount: gstResult.total_amount
      })
      .select()
      .single()
    
    if (invoiceError) return res.status(400).json({ error: invoiceError.message })
    
    // Insert line items
    const lineItemsToInsert = line_items.map((item: any) => ({
      invoice_id: invoice.id,
      description: item.description,
      hsn_sac_code: item.hsn_sac_code,
      quantity: item.quantity,
      unit: item.unit,
      rate: item.rate,
      amount: item.quantity * item.rate
    }))
    
    await supabase.from('invoice_line_items').insert(lineItemsToInsert)
    
    // Fetch complete invoice
    const { data: completeInvoice, error: fetchError } = await supabase
      .from('invoices')
      .select(`
        *,
        clients (company_name, gstin, billing_address, city, state),
        projects (project_name),
        invoice_line_items (*)
      `)
      .eq('id', invoice.id)
      .single()
    
    if (fetchError) return res.status(400).json({ error: fetchError.message })
    
    res.status(201).json(completeInvoice)
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
}
