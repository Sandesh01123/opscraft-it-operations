'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { Building2, Plus, Edit, X, MapPin, Phone, Mail } from 'lucide-react'

interface Client {
  id: string
  company_name: string
  contact_name: string
  email: string
  phone: string
  gstin: string
  city: string
  state: string
  is_same_state: boolean
  active_projects: number
  total_invoiced: number
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

export default function ClientsPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
  
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    if (!supabase) {
      setLoading(false)
      return
    }
    
    try {
      const response = await fetch(`${API_URL}/api/clients`)
      if (response.ok) {
        const data = await response.json()
        setClients(data)
      }
    } catch (error) {
      console.error('Error fetching clients:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    try {
      const response = await fetch(`${API_URL}/api/clients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: formData.get('company_name'),
          contact_name: formData.get('contact_name'),
          email: formData.get('email'),
          phone: formData.get('phone'),
          gstin: formData.get('gstin'),
          city: formData.get('city'),
          state: formData.get('state'),
          is_same_state: formData.get('is_same_state') === 'true'
        })
      })

      if (response.ok) {
        setShowForm(false)
        fetchClients()
        form.reset()
      }
    } catch (error) {
      console.error('Error creating client:', error)
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
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#e2e8f0', marginBottom: '6px' }}>Clients</h1>
          <p style={{ fontSize: '13px', color: '#64748b' }}>Manage your client relationships and billing</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="gradient-btn"
          style={{ padding: '10px 20px', fontSize: '13px' }}
        >
          + Add Client
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {clients.map((client) => (
          <div key={client.id} className="premium-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: `linear-gradient(135deg, #4facfe, #00f2fe)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(79,172,254,0.4)' }}>
                <Building2 className="w-6 h-6" style={{ color: 'white' }} />
              </div>
              <button style={{ padding: '8px', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <Edit className="w-4 h-4" style={{ color: '#64748b' }} />
              </button>
            </div>
            <h3 style={{ fontWeight: '600', fontSize: '16px', color: '#e2e8f0', marginBottom: '8px' }}>{client.company_name}</h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>{client.contact_name}</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#94a3b8' }}>
                <Mail className="w-4 h-4" style={{ color: '#667eea' }} />
                <span>{client.email}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#94a3b8' }}>
                <Phone className="w-4 h-4" style={{ color: '#667eea' }} />
                <span>{client.phone}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#94a3b8' }}>
                <MapPin className="w-4 h-4" style={{ color: '#667eea' }} />
                <span>{client.city}, {client.state}</span>
              </div>
            </div>

            <div style={{ paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Projects</p>
                <p style={{ fontSize: '15px', fontWeight: '600', color: '#e2e8f0' }}>{client.active_projects}</p>
              </div>
              <div>
                <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Total Invoiced</p>
                <p style={{ fontSize: '15px', fontWeight: '600', color: '#e2e8f0' }}>{formatIndianCurrency(client.total_invoiced)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'rgba(15,12,41,0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(102,126,234,0.2)', borderRadius: '20px', padding: '32px', width: '520px', maxWidth: '100%', animation: 'slide-up 0.3s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#e2e8f0' }}>Add New Client</h2>
              <button onClick={() => setShowForm(false)} style={{ padding: '8px', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <X className="w-5 h-5" style={{ color: '#64748b' }} />
              </button>
            </div>
            <form onSubmit={handleCreateClient} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '6px', color: '#94a3b8' }}>Company Name</label>
                <input
                  name="company_name"
                  required
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '11px 14px', color: '#e2e8f0', fontSize: '13px', width: '100%', outline: 'none', transition: 'all 0.3s ease' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '6px', color: '#94a3b8' }}>Contact Name</label>
                <input
                  name="contact_name"
                  required
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '11px 14px', color: '#e2e8f0', fontSize: '13px', width: '100%', outline: 'none', transition: 'all 0.3s ease' }}
                />
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
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '6px', color: '#94a3b8' }}>GSTIN</label>
                <input
                  name="gstin"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '11px 14px', color: '#e2e8f0', fontSize: '13px', width: '100%', outline: 'none', transition: 'all 0.3s ease' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '6px', color: '#94a3b8' }}>City</label>
                  <input
                    name="city"
                    required
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '11px 14px', color: '#e2e8f0', fontSize: '13px', width: '100%', outline: 'none', transition: 'all 0.3s ease' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '6px', color: '#94a3b8' }}>State</label>
                  <input
                    name="state"
                    required
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '11px 14px', color: '#e2e8f0', fontSize: '13px', width: '100%', outline: 'none', transition: 'all 0.3s ease' }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '6px', color: '#94a3b8' }}>Same State?</label>
                <select
                  name="is_same_state"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '11px 14px', color: '#e2e8f0', fontSize: '13px', width: '100%', outline: 'none', transition: 'all 0.3s ease' }}
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
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
                  Create Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
