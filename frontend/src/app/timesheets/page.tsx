'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { Clock, Plus, X, Calendar, User, Check } from 'lucide-react'

interface Timesheet {
  id: string
  employee_id: string
  project_id: string
  date: string
  hours_worked: number
  description: string
  status: string
  employees?: { full_name: string }
  projects?: { name: string }
}

export default function TimesheetsPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
  
  const [timesheets, setTimesheets] = useState<Timesheet[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchTimesheets()
  }, [])

  const fetchTimesheets = async () => {
    if (!supabase) {
      setLoading(false)
      return
    }
    
    try {
      const response = await fetch(`${API_URL}/api/timesheets`)
      if (response.ok) {
        const data = await response.json()
        setTimesheets(data)
      }
    } catch (error) {
      console.error('Error fetching timesheets:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTimesheet = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    try {
      const response = await fetch(`${API_URL}/api/timesheets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_id: formData.get('employee_id'),
          project_id: formData.get('project_id'),
          date: formData.get('date'),
          hours_worked: Number(formData.get('hours_worked')),
          description: formData.get('description')
        })
      })

      if (response.ok) {
        setShowForm(false)
        fetchTimesheets()
        form.reset()
      }
    } catch (error) {
      console.error('Error creating timesheet:', error)
    }
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
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#e2e8f0', marginBottom: '6px' }}>Timesheets</h1>
          <p style={{ fontSize: '13px', color: '#64748b' }}>Track employee hours and project time</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="gradient-btn"
          style={{ padding: '10px 20px', fontSize: '13px' }}
        >
          + Add Entry
        </button>
      </div>

      <div className="glass-card" style={{ overflow: 'hidden', marginTop: '20px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Date</th>
              <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Employee</th>
              <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Project</th>
              <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Hours</th>
              <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Description</th>
              <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {timesheets.map((timesheet) => (
              <tr key={timesheet.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <td style={{ padding: '16px 20px', fontSize: '13px', color: '#94a3b8' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar className="w-4 h-4" style={{ color: '#667eea' }} />
                    <span>{new Date(timesheet.date).toLocaleDateString('en-IN')}</span>
                  </div>
                </td>
                <td style={{ padding: '16px 20px', fontSize: '13px', color: '#94a3b8' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <User className="w-4 h-4" style={{ color: '#667eea' }} />
                    <span>{timesheet.employees?.full_name || 'N/A'}</span>
                  </div>
                </td>
                <td style={{ padding: '16px 20px', fontSize: '13px', color: '#94a3b8' }}>{timesheet.projects?.name || 'N/A'}</td>
                <td style={{ padding: '16px 20px', fontSize: '13px', color: '#94a3b8' }}>
                  <span style={{ fontWeight: '600', color: '#e2e8f0' }}>{timesheet.hours_worked.toFixed(1)} hrs</span>
                </td>
                <td style={{ padding: '16px 20px', fontSize: '13px', color: '#94a3b8' }}>{timesheet.description}</td>
                <td style={{ padding: '16px 20px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '600', padding: '4px 10px', borderRadius: '20px', ...(timesheet.status === 'approved' ? { background: 'rgba(46,213,115,0.15)', color: '#2ed573', border: '1px solid rgba(46,213,115,0.3)' } : { background: 'rgba(255,165,2,0.15)', color: '#ffa502', border: '1px solid rgba(255,165,2,0.3)' }) }}>
                    {timesheet.status}
                  </span>
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
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#e2e8f0' }}>Add Timesheet Entry</h2>
              <button onClick={() => setShowForm(false)} style={{ padding: '8px', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <X className="w-5 h-5" style={{ color: '#64748b' }} />
              </button>
            </div>
            <form onSubmit={handleCreateTimesheet} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '6px', color: '#94a3b8' }}>Employee</label>
                  <select
                    name="employee_id"
                    required
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '11px 14px', color: '#e2e8f0', fontSize: '13px', width: '100%', outline: 'none', transition: 'all 0.3s ease' }}
                  >
                    <option value="">Select employee</option>
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
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '6px', color: '#94a3b8' }}>Date</label>
                  <input
                    name="date"
                    type="date"
                    required
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '11px 14px', color: '#e2e8f0', fontSize: '13px', width: '100%', outline: 'none', transition: 'all 0.3s ease' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '6px', color: '#94a3b8' }}>Hours Worked</label>
                  <input
                    name="hours_worked"
                    type="number"
                    step="0.5"
                    required
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '11px 14px', color: '#e2e8f0', fontSize: '13px', width: '100%', outline: 'none', transition: 'all 0.3s ease' }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '6px', color: '#94a3b8' }}>Description</label>
                <textarea
                  name="description"
                  required
                  rows={3}
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '11px 14px', color: '#e2e8f0', fontSize: '13px', width: '100%', outline: 'none', transition: 'all 0.3s ease', resize: 'vertical' }}
                />
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
                  Add Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
