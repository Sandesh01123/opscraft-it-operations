'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { IndianRupee, Calendar, Download, DollarSign, AlertCircle } from 'lucide-react'

interface PayrollEntry {
  id: string
  employee_id: string
  employee_name: string
  month: string
  year: number
  basic_salary: number
  hra: number
  da: number
  gross_salary: number
  pf_deduction: number
  esi_deduction: number
  professional_tax: number
  tds: number
  total_deductions: number
  net_salary: number
  status: string
}

export default function PayrollPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
  
  const [payrollEntries, setPayrollEntries] = useState<PayrollEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())

  useEffect(() => {
    fetchPayroll()
  }, [selectedMonth, selectedYear])

  const fetchPayroll = async () => {
    if (!supabase) {
      setLoading(false)
      return
    }
    
    try {
      const response = await fetch(`${API_URL}/api/payroll?month=${selectedMonth}&year=${selectedYear}`)
      if (response.ok) {
        const data = await response.json()
        setPayrollEntries(data)
      }
    } catch (error) {
      console.error('Error fetching payroll:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProcessPayroll = async () => {
    try {
      const response = await fetch(`${API_URL}/api/payroll/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month: selectedMonth, year: parseInt(selectedYear) })
      })

      if (response.ok) {
        fetchPayroll()
      }
    } catch (error) {
      console.error('Error processing payroll:', error)
    }
  }

  const handleFinalizePayroll = async () => {
    try {
      const response = await fetch(`${API_URL}/api/payroll/finalize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month: selectedMonth, year: parseInt(selectedYear) })
      })

      if (response.ok) {
        fetchPayroll()
      }
    } catch (error) {
      console.error('Error finalizing payroll:', error)
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
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#e2e8f0', marginBottom: '6px' }}>Payroll</h1>
          <p style={{ fontSize: '13px', color: '#64748b' }}>Process and manage employee payroll with India-specific calculations</p>
        </div>
      </div>

      {/* Controls */}
      <div className="glass-card" style={{ padding: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '6px', color: '#94a3b8' }}>Month</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '11px 14px', color: '#e2e8f0', fontSize: '13px', outline: 'none', transition: 'all 0.3s ease' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '6px', color: '#94a3b8' }}>Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '11px 14px', color: '#e2e8f0', fontSize: '13px', outline: 'none', transition: 'all 0.3s ease' }}
            >
              <option value="2024">2024</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
            </select>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px' }}>
            <button
              onClick={handleProcessPayroll}
              className="gradient-btn"
              style={{ padding: '12px 24px', fontSize: '13px' }}
            >
              Process Payroll
            </button>
            <button
              onClick={handleFinalizePayroll}
              style={{ padding: '12px 24px', background: 'rgba(46,213,115,0.15)', border: '1px solid rgba(46,213,115,0.3)', borderRadius: '10px', color: '#2ed573', fontSize: '13px', cursor: 'pointer', transition: 'all 0.3s ease' }}
            >
              Finalize
            </button>
          </div>
        </div>
      </div>

      {/* Payroll Table */}
      <div className="glass-card" style={{ overflow: 'hidden', marginTop: '20px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Employee</th>
              <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Basic</th>
              <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Gross</th>
              <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Deductions</th>
              <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Net Salary</th>
              <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Status</th>
              <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {payrollEntries.map((entry) => (
              <tr key={entry.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <td style={{ padding: '16px 20px', fontSize: '13px', color: '#94a3b8' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700', color: 'white', flexShrink: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
                      {entry.employee_name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2)}
                    </div>
                    <div>
                      <p style={{ fontWeight: '600', color: '#e2e8f0', marginBottom: '2px' }}>{entry.employee_name}</p>
                      <p style={{ fontSize: '12px', color: '#64748b' }}>{entry.month} {entry.year}</p>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '16px 20px', fontSize: '13px', color: '#94a3b8' }}>{formatIndianCurrency(entry.basic_salary)}</td>
                <td style={{ padding: '16px 20px', fontSize: '13px', color: '#94a3b8' }}>{formatIndianCurrency(entry.gross_salary)}</td>
                <td style={{ padding: '16px 20px', fontSize: '13px', color: '#94a3b8' }}>{formatIndianCurrency(entry.total_deductions)}</td>
                <td style={{ padding: '16px 20px', fontSize: '13px', color: '#94a3b8' }}>
                  <span style={{ fontWeight: '700', fontSize: '15px', background: 'linear-gradient(135deg, #f6d365, #fda085)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {formatIndianCurrency(entry.net_salary)}
                  </span>
                </td>
                <td style={{ padding: '16px 20px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '600', padding: '4px 10px', borderRadius: '20px', ...(entry.status === 'finalized' ? { background: 'rgba(46,213,115,0.15)', color: '#2ed573', border: '1px solid rgba(46,213,115,0.3)' } : { background: 'rgba(255,165,2,0.15)', color: '#ffa502', border: '1px solid rgba(255,165,2,0.3)' }) }}>
                    {entry.status}
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

      {payrollEntries.length === 0 && (
        <div className="glass-card" style={{ padding: '48px', textAlign: 'center', marginTop: '20px' }}>
          <AlertCircle className="w-12 h-12" style={{ color: '#64748b', margin: '0 auto 16px' }} />
          <p style={{ color: '#64748b', fontSize: '14px' }}>No payroll entries found for this period</p>
          <p style={{ color: '#475569', fontSize: '12px', marginTop: '8px' }}>Click "Process Payroll" to generate entries</p>
        </div>
      )}
    </div>
  )
}
