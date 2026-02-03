import Link from 'next/link'
import { BarChart3, Home, Layers, LogOut, Settings, ShieldCheck, Users, Timer} from 'lucide-react'

const menuItems = [
  { href: '/admin', label: 'Overview', icon: Home, active: true },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/policies', label: 'Policies', icon: ShieldCheck },
  { href: '/admin/claims', label: 'Claims', icon: Layers },
  { href: '/admin/reports', label: 'Reports', icon: BarChart3 },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
  { href: '/admin/checkexpire', label: 'CheckExpire', icon: Timer },
]

export default function AdminSidebar() {
  return (
    <aside className="flex h-full flex-col gap-4 border-r border-border-light bg-white p-4">
      <div className="flex items-center gap-3 rounded-2xl bg-bg-soft px-3 py-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-primary to-secondary text-white shadow">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-text-dark">Admin Console</p>
          <p className="text-xs text-text-medium">Internal access</p>
        </div>
      </div>

      <nav className="space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition ${
              item.active
                ? 'bg-primary/10 text-primary'
                : 'text-text-dark hover:bg-bg-soft hover:text-primary'
            }`}
          >
            <item.icon className={`h-4 w-4 ${item.active ? 'text-primary' : 'text-text-medium'}`} />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="mt-auto">
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-xl border border-border-light px-3 py-2 text-sm font-semibold text-text-dark transition hover:border-red-500 hover:text-red-600"
          onClick={() => console.log('Sign out (stub)')}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  )
}
