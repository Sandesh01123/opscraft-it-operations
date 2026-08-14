'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  FolderKanban, 
  Clock, 
  Building2, 
  FileText, 
  Users, 
  CalendarOff, 
  IndianRupee,
  Briefcase,
  Menu,
  X,
  Settings,
  ChevronRight
} from 'lucide-react'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/projects', label: 'Projects', icon: FolderKanban },
  { href: '/timesheets', label: 'Timesheets', icon: Clock },
  { href: '/clients', label: 'Clients', icon: Building2 },
  { href: '/invoices', label: 'Invoices', icon: FileText },
  { href: '/employees', label: 'Employees', icon: Users },
  { href: '/leaves', label: 'Leaves', icon: CalendarOff },
  { href: '/payroll', label: 'Payroll', icon: IndianRupee },
]

export default function Navigation() {
  const [isExpanded, setIsExpanded] = useState(false)
  const pathname = usePathname()

  const getActiveStyle = (isActive: boolean) => {
    if (isActive) {
      return {
        background: 'linear-gradient(135deg, rgba(102,126,234,0.2), rgba(118,75,162,0.15))',
        borderLeft: '3px solid #764ba2',
        color: '#a78bfa'
      }
    }
    return {
      color: '#64748b'
    }
  }

  const getIconStyle = (isActive: boolean) => {
    if (isActive) {
      return { filter: 'drop-shadow(0 0 6px rgba(167,139,250,0.8))' }
    }
    return {}
  }

  return (
    <>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          position: 'fixed',
          top: '16px',
          left: '16px',
          zIndex: 50,
          padding: '12px',
          background: 'rgba(5,5,15,0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(102,126,234,0.3)',
          borderRadius: '12px',
          transition: 'all 0.3s ease'
        }}
      >
        {isExpanded ? <X className="w-6 h-6" style={{ color: '#a78bfa' }} /> : <Menu className="w-6 h-6" style={{ color: '#a78bfa' }} />}
      </button>

      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          background: 'rgba(5,5,15,0.95)',
          borderRight: '1px solid rgba(102,126,234,0.15)',
          backdropFilter: 'blur(20px)',
          width: isExpanded ? '256px' : '72px',
          transition: 'width 0.5s ease',
          zIndex: 40
        }}
      >
        <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '14px', 
              background: 'linear-gradient(135deg, #667eea, #764ba2)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(102,126,234,0.5)'
            }}>
              <Briefcase className="w-6 h-6" style={{ color: 'white' }} />
            </div>
            {isExpanded && (
              <span className="gradient-text" style={{ fontSize: '20px', fontWeight: '800' }}>OpsCraft</span>
            )}
          </Link>
        </div>

        <div style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            const activeStyle = getActiveStyle(isActive)
            const iconStyle = getIconStyle(isActive)
            
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  marginBottom: '4px',
                  ...activeStyle
                }}
              >
                <Icon 
                  className="w-6 h-6" 
                  style={iconStyle}
                />
                {isExpanded && (
                  <span style={{ fontWeight: '500', fontSize: '14px' }}>{item.label}</span>
                )}
                {isExpanded && !isActive && (
                  <ChevronRight className="w-4 h-4 ml-auto" style={{ opacity: 0.5 }} />
                )}
              </Link>
            )
          })}
        </div>

        <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ 
              width: '32px', 
              height: '32px', 
              borderRadius: '50%', 
              background: 'linear-gradient(135deg, #667eea, #764ba2)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontSize: '12px', 
              fontWeight: '700', 
              color: 'white' 
            }}>A</div>
            {isExpanded && (
              <div>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#e2e8f0' }}>Admin</div>
                <div style={{ fontSize: '10px', color: '#64748b' }}>Administrator</div>
              </div>
            )}
            {isExpanded && (
              <button style={{ padding: '8px', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <Settings className="w-5 h-5" style={{ color: '#64748b' }} />
              </button>
            )}
          </div>
        </div>
      </nav>

      <div style={{ 
        marginLeft: isExpanded ? '256px' : '72px', 
        transition: 'margin-left 0.5s ease',
        minHeight: '100vh',
        minHeight: 'calc(100vh - 0px)'
      }} />
    </>
  )
}
