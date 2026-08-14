'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { FolderKanban, Plus, Edit, X, Users, Calendar, DollarSign, CheckCircle2, AlertCircle } from 'lucide-react'

interface Project {
  id: string
  name: string
  client_id: string
  status: string
  priority: string
  start_date: string
  end_date: string
  budget: number
  hourly_rate: number
  progress: number
  tasks_count: number
  completed_tasks: number
  clients?: { company_name: string }
}

export default function ProjectsPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
  
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    if (!supabase) {
      setLoading(false)
      return
    }
    
    try {
      const response = await fetch(`${API_URL}/api/projects`)
      if (response.ok) {
        const data = await response.json()
        setProjects(data)
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    try {
      const response = await fetch(`${API_URL}/api/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          client_id: formData.get('client_id'),
          status: formData.get('status'),
          priority: formData.get('priority'),
          start_date: formData.get('start_date'),
          end_date: formData.get('end_date'),
          budget: Number(formData.get('budget')),
          hourly_rate: Number(formData.get('hourly_rate'))
        })
      })

      if (response.ok) {
        setShowForm(false)
        fetchProjects()
        form.reset()
      }
    } catch (error) {
      console.error('Error creating project:', error)
    }
  }

  const formatIndianCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    const colors: any = {
      active: { bg: 'rgba(46,213,115,0.15)', color: '#2ed573', border: 'rgba(46,213,115,0.3)' },
      in_progress: { bg: 'rgba(79,172,254,0.15)', color: '#4facfe', border: 'rgba(79,172,254,0.3)' },
      completed: { bg: 'rgba(102,126,234,0.15)', color: '#667eea', border: 'rgba(102,126,234,0.3)' },
      on_hold: { bg: 'rgba(255,165,2,0.15)', color: '#ffa502', border: 'rgba(255,165,2,0.3)' }
    }
    return colors[status] || colors.active
  }

  const getPriorityColor = (priority: string) => {
    const colors: any = {
      high: { bg: 'rgba(255,71,87,0.15)', color: '#ff4757', border: 'rgba(255,71,87,0.3)' },
      medium: { bg: 'rgba(255,165,2,0.15)', color: '#ffa502', border: 'rgba(255,165,2,0.3)' },
      low: { bg: 'rgba(46,213,115,0.15)', color: '#2ed573', border: 'rgba(46,213,115,0.3)' }
    }
    return colors[priority] || colors.medium
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

  const activeProjects = projects.filter(p => p.status === 'active' || p.status === 'in_progress')
  const completedProjects = projects.filter(p => p.status === 'completed')
  const onHoldProjects = projects.filter(p => p.status === 'on_hold')

  return (
    <div style={{ padding: '28px 28px 28px 28px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#e2e8f0', marginBottom: '6px' }}>Projects</h1>
          <p style={{ fontSize: '13px', color: '#64748b' }}>Track and manage your project portfolio</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="gradient-btn"
          style={{ padding: '10px 20px', fontSize: '13px' }}
        >
          + New Project
        </button>
      </div>

      {/* Kanban Board */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Active Projects */}
        <div>
          <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2ed573', boxShadow: '0 0 12px rgba(46,213,115,0.5)' }}></div>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0' }}>Active ({activeProjects.length})</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {activeProjects.map((project) => (
              <div key={project.id} className="premium-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#e2e8f0', marginBottom: '4px' }}>{project.name}</h4>
                  <span style={{ fontSize: '10px', fontWeight: '600', padding: '3px 8px', borderRadius: '12px', background: getPriorityColor(project.priority).bg, color: getPriorityColor(project.priority).color, border: `1px solid ${getPriorityColor(project.priority).border}` }}>
                    {project.priority}
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>{project.clients?.company_name || 'N/A'}</p>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <Users className="w-4 h-4" style={{ color: '#667eea' }} />
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>{project.tasks_count} tasks</span>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>•</span>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>{project.completed_tasks} completed</span>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12px' }}>
                    <span style={{ color: '#64748b' }}>Progress</span>
                    <span style={{ color: '#667eea', fontWeight: '600' }}>{project.progress}%</span>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: 'linear-gradient(90deg, #667eea, #764ba2)', borderRadius: '3px', width: `${project.progress}%` }}></div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <div>
                    <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '2px' }}>Budget</p>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: '#e2e8f0' }}>{formatIndianCurrency(project.budget)}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '2px' }}>Rate</p>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: '#e2e8f0' }}>₹{project.hourly_rate}/hr</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Completed Projects */}
        <div>
          <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#667eea', boxShadow: '0 0 12px rgba(102,126,234,0.5)' }}></div>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0' }}>Completed ({completedProjects.length})</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {completedProjects.map((project) => (
              <div key={project.id} className="premium-card" style={{ padding: '20px', opacity: 0.8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#e2e8f0', marginBottom: '4px' }}>{project.name}</h4>
                  <CheckCircle2 className="w-5 h-5" style={{ color: '#667eea' }} />
                </div>
                <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>{project.clients?.company_name || 'N/A'}</p>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <div>
                    <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '2px' }}>Budget</p>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: '#e2e8f0' }}>{formatIndianCurrency(project.budget)}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '2px' }}>Completed</p>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: '#667eea' }}>{new Date(project.end_date).toLocaleDateString('en-IN')}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* On Hold Projects */}
        <div>
          <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ffa502', boxShadow: '0 0 12px rgba(255,165,2,0.5)' }}></div>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0' }}>On Hold ({onHoldProjects.length})</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {onHoldProjects.map((project) => (
              <div key={project.id} className="premium-card" style={{ padding: '20px', opacity: 0.8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#e2e8f0', marginBottom: '4px' }}>{project.name}</h4>
                  <AlertCircle className="w-5 h-5" style={{ color: '#ffa502' }} />
                </div>
                <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>{project.clients?.company_name || 'N/A'}</p>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <div>
                    <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '2px' }}>Budget</p>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: '#e2e8f0' }}>{formatIndianCurrency(project.budget)}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '2px' }}>Progress</p>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: '#ffa502' }}>{project.progress}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'rgba(15,12,41,0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(102,126,234,0.2)', borderRadius: '20px', padding: '32px', width: '520px', maxWidth: '100%', animation: 'slide-up 0.3s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#e2e8f0' }}>New Project</h2>
              <button onClick={() => setShowForm(false)} style={{ padding: '8px', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <X className="w-5 h-5" style={{ color: '#64748b' }} />
              </button>
            </div>
            <form onSubmit={handleCreateProject} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '6px', color: '#94a3b8' }}>Project Name</label>
                <input
                  name="name"
                  required
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '11px 14px', color: '#e2e8f0', fontSize: '13px', width: '100%', outline: 'none', transition: 'all 0.3s ease' }}
                />
              </div>
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '6px', color: '#94a3b8' }}>Status</label>
                  <select
                    name="status"
                    required
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '11px 14px', color: '#e2e8f0', fontSize: '13px', width: '100%', outline: 'none', transition: 'all 0.3s ease' }}
                  >
                    <option value="active">Active</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="on_hold">On Hold</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '6px', color: '#94a3b8' }}>Priority</label>
                  <select
                    name="priority"
                    required
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '11px 14px', color: '#e2e8f0', fontSize: '13px', width: '100%', outline: 'none', transition: 'all 0.3s ease' }}
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '6px', color: '#94a3b8' }}>Start Date</label>
                  <input
                    name="start_date"
                    type="date"
                    required
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '11px 14px', color: '#e2e8f0', fontSize: '13px', width: '100%', outline: 'none', transition: 'all 0.3s ease' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '6px', color: '#94a3b8' }}>End Date</label>
                  <input
                    name="end_date"
                    type="date"
                    required
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '11px 14px', color: '#e2e8f0', fontSize: '13px', width: '100%', outline: 'none', transition: 'all 0.3s ease' }}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '6px', color: '#94a3b8' }}>Budget (₹)</label>
                  <input
                    name="budget"
                    type="number"
                    required
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '11px 14px', color: '#e2e8f0', fontSize: '13px', width: '100%', outline: 'none', transition: 'all 0.3s ease' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '6px', color: '#94a3b8' }}>Hourly Rate (₹)</label>
                  <input
                    name="hourly_rate"
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
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
