"use client"

import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Calendar, Video, FileText, User, Settings, LogOut, Heart, Users, BarChart3 } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const patientNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/appointments", label: "Appointments", icon: Calendar },
  { href: "/teleconsultation", label: "Teleconsultation", icon: Video },
  { href: "/medical-records", label: "Medical Records", icon: FileText },
  { href: "/profile", label: "Profile", icon: User },
]

const doctorNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/appointments", label: "My Appointments", icon: Calendar },
  { href: "/patients", label: "Patients", icon: Users },
  { href: "/teleconsultation", label: "Teleconsultation", icon: Video },
  { href: "/profile", label: "Profile", icon: User },
]

const adminNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/users", label: "User Management", icon: Users },
  { href: "/appointments", label: "All Appointments", icon: Calendar },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
]

export function Sidebar() {
  const { userProfile, logout } = useAuth()
  const pathname = usePathname()

  if (!userProfile) return null

  const getNavItems = () => {
    switch (userProfile.role) {
      case "patient":
        return patientNavItems
      case "doctor":
        return doctorNavItems
      case "admin":
        return adminNavItems
      default:
        return patientNavItems
    }
  }

  const navItems = getNavItems()

  return (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border">
      {/* Header */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center space-x-2">
          <Heart className="h-8 w-8 text-sidebar-primary" />
          <h1 className="text-xl font-bold text-sidebar-primary">HealthConnect</h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className={cn("w-full justify-start", isActive && "bg-sidebar-primary text-sidebar-primary-foreground")}
              >
                <Icon className="mr-3 h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          )
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center space-x-3 mb-4">
          <Avatar>
            <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">
              {userProfile.firstName[0]}
              {userProfile.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {userProfile.firstName} {userProfile.lastName}
            </p>
            <p className="text-xs text-sidebar-foreground/70 capitalize">{userProfile.role}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={logout}
        >
          <LogOut className="mr-3 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}
