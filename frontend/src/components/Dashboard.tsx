'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { 
  FolderKanban, 
  Users, 
  IndianRupee, 
  Clock, 
  FileText, 
  CalendarOff,
  TrendingUp
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Area, AreaChart } from 'recharts'

interface DashboardStats {
  activeProjects: number
  totalEmployees: number
  totalClients: number
  monthlyRevenue: number
  pendingInvoices: { count: number; amount: number }
  hoursThisMonth: number
  pendingLeaves: number
  projectStatusBreakdown: { name: string; value: number; color: string }[]
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [revenueData, setRevenueData] = useState<any[]>([])
  const [recentInvoices, setRecentInvoices] = useState<any[]>([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    if (!supabase) {
      console.error('Supabase client not available')
      setLoading(false)
      return
    }

    try {
      const now = new Date()
      const currentMonth = now.getMonth()
      const currentYear = now.getFullYear()
      const firstDayOfMonth = new Date(currentYear, currentMonth, 1).toISOString().split('T')[0]

      const [
        projectsResult,
        employeesResult,
        clientsResult,
        invoicesResult,
        timesheetsResult,
        leavesResult,
        allInvoicesResult
      ] = await Promise.all([
        supabase.from('projects').select('status').eq('status', 'active'),
        supabase.from('employees').select('id').eq('status', 'active'),
        supabase.from('clients').select('id').eq('status', 'active'),
        supabase.from('invoices').select('total_amount, status, invoice_date').gte('invoice_date', firstDayOfMonth),
        supabase.from('timesheets').select('hours_worked').gte('date', firstDayOfMonth),
        supabase.from('leaves').select('id').eq('status', 'pending'),
        supabase.from('invoices').select('invoice_number, total_amount, status, due_date, clients(company_name)').order('invoice_date', { ascending: false }).limit(5)
      ])

      const activeProjects = projectsResult.data?.length || 0
      const totalEmployees = employeesResult.data?.length || 0
      const totalClients = clientsResult.data?.length || 0
      
      const paidInvoices = invoicesResult.data?.filter(i => i.status === 'paid') || []
      const monthlyRevenue = paidInvoices.reduce((sum, i) => sum + Number(i.total_amount), 0)
      
      const unpaidInvoices = invoicesResult.data?.filter(i => i.status === 'unpaid') || []
      const pendingInvoices = {
        count: unpaidInvoices.length,
        amount: unpaidInvoices.reduce((sum, i) => sum + Number(i.total_amount), 0)
      }
      
      const hoursThisMonth = timesheetsResult.data?.reduce((sum, t) => sum + Number(t.hours_worked), 0) || 0
      const pendingLeaves = leavesResult.data?.length || 0

      const allProjectsResult = await supabase.from('projects').select('status')
      const projectStatusCount: any = {}
      allProjectsResult.data?.forEach((p: any) => {
        projectStatusCount[p.status] = (projectStatusCount[p.status] || 0) + 1
      })
      
      const projectStatusBreakdown = [
        { name: 'Active', value: projectStatusCount.active || 0, color: '#667eea' },
        { name: 'In Progress', value: projectStatusCount.in_progress || 0, color: '#f6d365' },
        { name: 'Completed', value: projectStatusCount.completed || 0, color: '#4facfe' }
      ].filter(item => item.value > 0)

      const revenueByMonth: any[] = []
      for (let i = 5; i >= 0; i--) {
        const month = new Date(currentYear, currentMonth - i, 1)
        const monthName = month.toLocaleString('default', { month: 'short' })
        const startDate = new Date(currentYear, currentMonth - i, 1).toISOString().split('T')[0]
        const endDate = new Date(currentYear, currentMonth - i + 1, 0).toISOString().split('T')[0]
        
        const { data: monthInvoices } = await supabase
          .from('invoices')
          .select('total_amount')
          .eq('status', 'paid')
          .gte('invoice_date', startDate)
          .lte('invoice_date', endDate)
        
        const monthTotal = monthInvoices?.reduce((sum, inv) => sum + Number(inv.total_amount), 0) || 0
        revenueByMonth.push({ name: monthName, revenue: monthTotal })
      }
      setRevenueData(revenueByMonth)

      setRecentInvoices(allInvoicesResult.data || [])

      setStats({
        activeProjects,
        totalEmployees,
        totalClients,
        monthlyRevenue,
        pendingInvoices,
        hoursThisMonth,
        pendingLeaves,
        projectStatusBreakdown
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatIndianCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 18) return 'Good Afternoon'
    return 'Good Evening'
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

  if (!stats) {
    return (
      <div style={{ textAlign: 'center', padding: '48px' }}>
        <p style={{ color: '#64748b' }}>Failed to load dashboard data</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '28px 28px 28px 28px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, #1a0533 0%, #0f0c29 40%, #1a1060 100%)',
        borderRadius: '20px',
        padding: '28px 32px',
        marginBottom: '24px',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(102,126,234,0.2)'
      }}>
        {/* Animated gradient orbs */}
        <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(102,126,234,0.3) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '-60px', left: '30%', width: '150px', height: '150px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(240,93,251,0.2) 0%, transparent 70%)' }} />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Welcome back
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: '800', color: 'white', marginBottom: '8px', lineHeight: 1.2 }}>
              {getGreeting()}, Admin 👋
            </h1>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', maxWidth: '400px' }}>
              Here's what's happening with your IT operations today.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexShrink: 0 }}>
            <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', borderRadius: '12px', padding: '12px 18px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.15)' }}>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', marginBottom: '4px', textTransform: 'uppercase' }}>Today</div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: 'white' }}>{new Date().getDate()}</div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>{new Date().toLocaleString('default', { month: 'short' })}</div>
            </div>
          </div>
        </div>

        {/* Quick action buttons */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px', position: 'relative', zIndex: 1, flexWrap: 'wrap' }}>
          {[
            { label: '+ New Project', href: '/projects', colors: ['#667eea','#764ba2'] },
            { label: '+ Add Employee', href: '/employees', colors: ['#4facfe','#00f2fe'] },
            { label: '+ Create Invoice', href: '/invoices', colors: ['#2ed573','#26de81'] },
            { label: '₹ Run Payroll', href: '/payroll', colors: ['#f6d365','#fda085'] },
          ].map(({ label, href, colors }) => (
            <a key={href} href={href} style={{
              padding: '8px 16px',
              background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`,
              borderRadius: '8px',
              color: 'white',
              fontWeight: '600',
              fontSize: '12px',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
              border: 'none',
              cursor: 'pointer'
            }}>
              {label}
            </a>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        <KPICard
          title="Active Projects"
          value={stats.activeProjects}
          icon={FolderKanban}
          colors={['#667eea','#764ba2']}
          delay="0s"
        />
        <KPICard
          title="Team Members"
          value={stats.totalEmployees}
          icon={Users}
          colors={['#4facfe','#00f2fe']}
          delay="0.1s"
        />
        <KPICard
          title="Monthly Revenue"
          value={formatIndianCurrency(stats.monthlyRevenue)}
          icon={IndianRupee}
          colors={['#f6d365','#fda085']}
          delay="0.2s"
          featured
        />
        <KPICard
          title="Hours This Month"
          value={stats.hoursThisMonth.toFixed(1)}
          icon={Clock}
          colors={['#f093fb','#f5576c']}
          delay="0.3s"
        />
        <KPICard
          title="Pending Invoices"
          value={stats.pendingInvoices.count}
          icon={FileText}
          colors={['#ffa502','#ff6b6b']}
          delay="0.4s"
        />
        <KPICard
          title="Pending Leaves"
          value={stats.pendingLeaves}
          icon={CalendarOff}
          colors={['#2ed573','#1e90ff']}
          delay="0.5s"
        />
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '28px' }}>
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#e2e8f0' }}>Monthly Revenue</h3>
            <span style={{ fontSize: '11px', color: '#64748b' }}>Last 6 months</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#667eea" stopOpacity={0.3}/>
                  <stop offset="100%" stopColor="#667eea" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f0c29', border: '1px solid rgba(102,126,234,0.3)', borderRadius: '12px', color: '#e2e8f0' }}
                labelStyle={{ color: '#a78bfa', fontWeight: '600' }}
                formatter={(value: number) => [formatIndianCurrency(value), 'Revenue']}
              />
              <Area type="monotone" dataKey="revenue" stroke="#667eea" fill="url(#areaGradient)" strokeWidth={2.5}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#e2e8f0' }}>Project Status</h3>
            <span style={{ fontSize: '11px', color: '#64748b' }}>Breakdown</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.projectStatusBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {stats.projectStatusBreakdown.map((entry) => (
                  <Cell key={`cell-${entry.name}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f0c29', border: '1px solid rgba(102,126,234,0.3)', borderRadius: '12px', color: '#e2e8f0' }}
                labelStyle={{ color: '#a78bfa', fontWeight: '600' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Invoices */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#e2e8f0' }}>Recent Invoices</h3>
          <a href="/invoices" style={{ fontSize: '12px', color: '#a78bfa', textDecoration: 'none' }}>View all →</a>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(102,126,234,0.08)' }}>
              <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Invoice</th>
              <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Client</th>
              <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Amount</th>
              <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
              <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Due Date</th>
            </tr>
          </thead>
          <tbody>
            {recentInvoices.map((invoice) => (
              <tr key={invoice.invoice_number} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <td style={{ padding: '14px 24px', fontSize: '13px', color: '#94a3b8' }}>
                  <span style={{ fontWeight: '600', color: '#e2e8f0' }}>{invoice.invoice_number}</span>
                </td>
                <td style={{ padding: '14px 24px', fontSize: '13px', color: '#94a3b8' }}>{invoice.clients?.company_name || 'N/A'}</td>
                <td style={{ padding: '14px 24px', fontSize: '13px', color: '#94a3b8' }}>{formatIndianCurrency(invoice.total_amount)}</td>
                <td style={{ padding: '14px 24px' }}>
                  <StatusBadge status={invoice.status} />
                </td>
                <td style={{ padding: '14px 24px', fontSize: '13px', color: '#94a3b8' }}>{new Date(invoice.due_date).toLocaleDateString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function KPICard({ title, value, icon: Icon, colors, delay, featured = false }: { 
  title: string; 
  value: string | number; 
  icon: any; 
  colors: string[];
  delay: string;
  featured?: boolean;
}) {
  return (
    <div className="premium-card animate-float" style={{ padding: '24px', animationDelay: delay }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(102,126,234,0.4)' }}>
          <Icon size={22} color="white" />
        </div>
        <span style={{ fontSize: '11px', fontWeight: '600', padding: '4px 8px', borderRadius: '20px', background: 'rgba(46,213,115,0.15)', color: '#2ed573' }}>↑ Live</span>
      </div>
      <div style={{ fontSize: '32px', fontWeight: '800', color: featured ? 'transparent' : '#e2e8f0', marginBottom: '4px', letterSpacing: '-0.02em', ...(featured ? { background: 'linear-gradient(135deg, #f6d365, #fda085)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' } : {}) }}>
        {value}
      </div>
      <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>{title}</div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    paid: { background: 'rgba(46,213,115,0.15)', color: '#2ed573', border: '1px solid rgba(46,213,115,0.3)', borderRadius: '20px', padding: '3px 10px', fontSize: '11px', fontWeight: '600' },
    unpaid: { background: 'rgba(255,165,2,0.15)', color: '#ffa502', border: '1px solid rgba(255,165,2,0.3)', borderRadius: '20px', padding: '3px 10px', fontSize: '11px', fontWeight: '600' },
    overdue: { background: 'rgba(255,71,87,0.15)', color: '#ff4757', border: '1px solid rgba(255,71,87,0.3)', borderRadius: '20px', padding: '3px 10px', fontSize: '11px', fontWeight: '600', animation: 'pulse-glow 2s infinite' }
  }

  return (
    <span style={styles[status] || styles.unpaid}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}
