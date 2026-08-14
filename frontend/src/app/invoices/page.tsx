'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { FileText, Plus, Edit, X, Download, Calendar, DollarSign } from 'lucide-react'

interface Invoice {
  id: string
  invoice_number: string
  client_id: string
  project_id: string
  invoice_date: string
  due_date: string
  subtotal: number
  gst_amount: number
  total_amount: number
  status: string
  clients?: { company_name: string; is_same_state: boolean }
  projects?: { name: string }
}

export default function InvoicesPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
  
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedClient, setSelectedClient] = useState<any>(null)
  const [subtotal, setSubtotal] = useState(0)

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    if (!supabase) {
      setLoading(false)
      return
    }
    
    try {
      const response = await fetch(`${API_URL}/api/invoices`)
      if (response.ok) {
        const data = await response.json()
        setInvoices(data)
      }
    } catch (error) {
      console.error('Error fetching invoices:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubtotalChange = (value: number) => {
    setSubtotal(value)
  }

  const gstAmount = subtotal * 0.18
  const total = subtotal + gstAmount

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    try {
      const response = await fetch(`${API_URL}/api/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: formData.get('client_id'),
          project_id: formData.get('project_id'),
          invoice_date: formData.get('invoice_date'),
          due_date: formData.get('due_date'),
          subtotal: Number(formData.get('subtotal')),
          gst_amount: gstAmount,
          total_amount: total
        })
      })

      if (response.ok) {
        setShowForm(false)
        fetchInvoices()
        form.reset()
        setSubtotal(0)
      }
    } catch (error) {
      console.error('Error creating invoice:', error)
    }
  }

  const formatIndianCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div style={{ position: 'relative' }}>
          <div style={{ width: '64px', height: '64px', border: '4px solid rgba(102,126,234,0.3)', borderRadius: '50%' }}></div>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '64px', height: '64px', border: '4px solid transparent', borderTopColor: '#667eea', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '28px 28px 28px 28px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#e2e8f0', marginBottom: '6px' }}>Invoices</h1>
          <p style={{ fontSize: '13px', color: '#64748b' }}>Manage your billing and payments</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="gradient-btn"
          style={{ padding: '10px 20px', fontSize: '13px' }}
        >
          + Create Invoice
        </button>
      </div>

      <div className="glass-card" style={{ overflow: 'hidden', marginTop: '20px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Invoice</th>
              <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Client</th>
              <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Project</th>
              <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Amount</th>
              <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Due Date</th>
              <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Status</th>
              <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <td style={{ padding: '16px 20px', fontSize: '13px', color: '#94a3b8' }}>
                  <span style={{ fontWeight: '600', color: '#e2e8f0' }}>{invoice.invoice_number}</span>
                </td>
                <td style={{ padding: '16px 20px', fontSize: '13px', color: '#94a3b8' }}>{invoice.clients?.company_name || 'N/A'}</td>
                <td style={{ padding: '16px 20px', fontSize: '13px', color: '#94a3b8' }}>{invoice.projects?.name || 'N/A'}</td>
                <td style={{ padding: '16px 20px', fontSize: '13px', color: '#94a3b8' }}>{formatIndianCurrency(invoice.total_amount)}</td>
                <td style={{ padding: '16px 20px', fontSize: '13px', color: '#94a3b8' }}>{new Date(invoice.due_date).toLocaleDateString('en-IN')}</td>
                <td style={{ padding: '16px 20px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '600', padding: '4px 10px', borderRadius: '20px', ...(invoice.status === 'paid' ? { background: 'rgba(46,213,115,0.15)', color: '#2ed573', border: '1px solid rgba(46,213,115,0.3)' } : invoice.status === 'overdue' ? { background: 'rgba(255,71,87,0.15)', color: '#ff4757', border: '1px solid rgba(255,71,87,0.3)', animation: 'pulse-glow 2s infinite' } : { background: 'rgba(255,165,2,0.15)', color: '#ffa502', border: '1px solid rgba(255,165,2,0.3)' }) }}>
                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                  </span>
                </td>
                <td style={{ padding: '16px 20px' }}>
                  <button style={{ padding: '8px', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                    <Download className="w-4 h-4" style={{ color: '#64748b' }} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'rgba(15,12,41,0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(102,126,234,0.2)', borderRadius: '20px', padding: '32px', width: '520px', maxWidth: '100%', animation: 'slide-up 0.3s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#e2e8f0' }}>Create Invoice</h2>
              <button onClick={() => setShowForm(false)} style={{ padding: '8px', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <X className="w-5 h-5" style={{ color: '#64748b' }} />
              </button>
            </div>
            <form onSubmit={handleCreateInvoice} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '6px', color: '#94a3b8' }}>Client</label>
                <select
                  name="client_id"
                  required
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '11px 14px', color: '#e2e8f0', fontSize: '13px', width: '100%', outline: 'none', transition: 'all 0.3s ease' }}
                >
                  <option value="">Select client</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '6px', color: '#94a3b8' }}>Project</label>
                <select
                  name="project_id"
                  required
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '11px 14px', color: '#e2e8f0', fontSize: '13px', width: '100%', outline: 'none', transition: 'all 0.3s ease' }}
                >
                  <option value="">Select project</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '6px', color: '#94a3b8' }}>Invoice Date</label>
                  <input
                    name="invoice_date"
                    type="date"
                    required
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '11px 14px', color: '#e2e8f0', fontSize: '13px', width: '100%', outline: 'none', transition: 'all 0.3s ease' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '6px', color: '#94a3b8' }}>Due Date</label>
                  <input
                    name="due_date"
                    type="date"
                    required
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '11px 14px', color: '#e2e8f0', fontSize: '13px', width: '100%', outline: 'none', transition: 'all 0.3s ease' }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '6px', color: '#94a3b8' }}>Subtotal (₹)</label>
                <input
                  name="subtotal"
                  type="number"
                  required
                  value={subtotal || ''}
                  onChange={(e) => handleSubtotalChange(Number(e.target.value))}
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '11px 14px', color: '#e2e8f0', fontSize: '13px', width: '100%', outline: 'none', transition: 'all 0.3s ease' }}
                />
              </div>

              {/* GST Preview */}
              <div style={{ background: 'rgba(102,126,234,0.08)', border: '1px solid rgba(102,126,234,0.2)', borderRadius: '12px', padding: '16px', marginTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                  <span style={{ color: '#64748b' }}>Subtotal</span>
                  <span style={{ color: '#e2e8f0', fontWeight: '600' }}>₹{subtotal.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                  <span style={{ color: '#64748b' }}>GST 18%</span>
                  <span style={{ color: '#a78bfa' }}>₹{gstAmount.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: '16px', fontWeight: '700' }}>
                  <span style={{ color: '#e2e8f0' }}>Total</span>
                  <span style={{ background: 'linear-gradient(135deg, #667eea, #f093fb)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>₹{total.toFixed(2)}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#e2e8f0', fontSize: '13px', cursor: 'pointer', transition: 'all 0.3s ease' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="gradient-btn"
                  style={{ flex: 1, padding: '12px', fontSize: '13px' }}
                >
                  Create Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
