'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { Users, Plus, Edit, X, Calendar, DollarSign, Building } from 'lucide-react'

interface Employee {
  id: string
  employee_code: string
  full_name: string
  email: string
  phone: string
  designation: string
  department: string
  date_of_joining: string
  basic_salary: number
  bank_name: string
  account_number: string
  ifsc_code: string
  pf_number: string
  esi_number: string
  status: string
}

function getAvatar(name: string) {
  const colors = [
    ['#667eea','#764ba2'],['#f093fb','#f5576c'],['#4facfe','#00f2fe'],
    ['#f6d365','#fda085'],['#2ed573','#1e90ff'],['#ffa502','#ff6b6b']
  ]
  const pair = colors[name.charCodeAt(0) % colors.length]
  const initials = name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2)
  return { gradient: `linear-gradient(135deg, ${pair[0]}, ${pair[1]})`, initials }
}

export default function EmployeesPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
  
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    if (!supabase) {
      setLoading(false)
      return
    }
    
    try {
      const response = await fetch(`${API_URL}/api/employees`)
      if (response.ok) {
        const data = await response.json()
        setEmployees(data)
      }
    } catch (error) {
      console.error('Error fetching employees:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    try {
      const response = await fetch(`${API_URL}/api/employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_code: formData.get('employee_code'),
          full_name: formData.get('full_name'),
          email: formData.get('email'),
          phone: formData.get('phone'),
          designation: formData.get('designation'),
          department: formData.get('department'),
          date_of_joining: formData.get('date_of_joining'),
          basic_salary: Number(formData.get('basic_salary')),
          bank_name: formData.get('bank_name'),
          account_number: formData.get('account_number'),
          ifsc_code: formData.get('ifsc_code'),
          pf_number: formData.get('pf_number'),
          esi_number: formData.get('esi_number')
        })
      })

      if (response.ok) {
        setShowForm(false)
        fetchEmployees()
        form.reset()
      }
    } catch (error) {
      console.error('Error creating employee:', error)
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
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#e2e8f0', marginBottom: '6px' }}>Employees</h1>
          <p style={{ fontSize: '13px', color: '#64748b' }}>Manage your team members and their details</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="gradient-btn"
          style={{ padding: '10px 20px', fontSize: '13px' }}
        >
          + Add Employee
        </button>
      </div>

      <div className="glass-card" style={{ overflow: 'hidden', marginTop: '20px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Employee</th>
              <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Department</th>
              <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Designation</th>
              <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Basic Salary</th>
              <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Joining Date</th>
              <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Status</th>
              <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr key={employee.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <td style={{ padding: '16px 20px', fontSize: '13px', color: '#94a3b8' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: getAvatar(employee.full_name).gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700', color: 'white', flexShrink: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
                      {getAvatar(employee.full_name).initials}
                    </div>
                    <div>
                      <p style={{ fontWeight: '600', color: '#e2e8f0', marginBottom: '2px' }}>{employee.full_name}</p>
                      <p style={{ fontSize: '12px', color: '#64748b' }}>{employee.employee_code}</p>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '16px 20px', fontSize: '13px', color: '#94a3b8' }}>{employee.department}</td>
                <td style={{ padding: '16px 20px', fontSize: '13px', color: '#94a3b8' }}>{employee.designation}</td>
                <td style={{ padding: '16px 20px', fontSize: '13px', color: '#94a3b8' }}>{formatIndianCurrency(employee.basic_salary)}</td>
                <td style={{ padding: '16px 20px', fontSize: '13px', color: '#94a3b8' }}>{new Date(employee.date_of_joining).toLocaleDateString('en-IN')}</td>
                <td style={{ padding: '16px 20px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '600', padding: '4px 10px', borderRadius: '20px', ...(employee.status === 'active' ? { background: 'rgba(46,213,115,0.15)', color: '#2ed573', border: '1px solid rgba(46,213,115,0.3)' } : { background: 'rgba(100,116,139,0.15)', color: '#64748b', border: '1px solid rgba(100,116,139,0.3)' }) }}>
                    {employee.status}
                  </span>
                </td>
                <td style={{ padding: '16px 20px' }}>
                  <button style={{ padding: '8px', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                    <Edit className="w-4 h-4" style={{ color: '#64748b' }} />
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
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#e2e8f0' }}>Add New Employee</h2>
              <button onClick={() => setShowForm(false)} style={{ padding: '8px', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <X className="w-5 h-5" style={{ color: '#64748b' }} />
              </button>
            </div>
            <form onSubmit={handleCreateEmployee} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '6px', color: '#94a3b8' }}>Employee Code</label>
                  <input
                    name="employee_code"
                    required
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '11px 14px', color: '#e2e8f0', fontSize: '13px', width: '100%', outline: 'none', transition: 'all 0.3s ease' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '6px', color: '#94a3b8' }}>Full Name</label>
                  <input
                    name="full_name"
                    required
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '11px 14px', color: '#e2e8f0', fontSize: '13px', width: '100%', outline: 'none', transition: 'all 0.3s ease' }}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '6px', color: '#94a3b8' }}>Email</label>
                  <input
                    name="email"
                    type="email"
                    required
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '11px 14px', color: '#e2e8f0', fontSize: '13px', width: '100%', outline: 'none', transition: 'all 0.3s ease' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '6px', color: '#94a3b8' }}>Phone</label>
                  <input
                    name="phone"
                    required
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '11px 14px', color: '#e2e8f0', fontSize: '13px', width: '100%', outline: 'none', transition: 'all 0.3s ease' }}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '6px', color: '#94a3b8' }}>Department</label>
                  <input
                    name="department"
                    required
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '11px 14px', color: '#e2e8f0', fontSize: '13px', width: '100%', outline: 'none', transition: 'all 0.3s ease' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '6px', color: '#94a3b8' }}>Designation</label>
                  <input
                    name="designation"
                    required
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '11px 14px', color: '#e2e8f0', fontSize: '13px', width: '100%', outline: 'none', transition: 'all 0.3s ease' }}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '6px', color: '#94a3b8' }}>Date of Joining</label>
                  <input
                    name="date_of_joining"
                    type="date"
                    required
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '11px 14px', color: '#e2e8f0', fontSize: '13px', width: '100%', outline: 'none', transition: 'all 0.3s ease' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '6px', color: '#94a3b8' }}>Basic Salary</label>
                  <input
                    name="basic_salary"
                    type="number"
                    required
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '11px 14px', color: '#e2e8f0', fontSize: '13px', width: '100%', outline: 'none', transition: 'all 0.3s ease' }}
                  />
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
                  Create Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
