"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { clsx } from "clsx"
import {
  Bell,
  LayoutDashboard,
  FolderOpen,
  Shield,
  FileText,
  Settings,
  AlertTriangle,
  Users,
  Database,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useAuth } from "@/context/AuthContext"

export function Sidebar() {
  const pathname = usePathname()
  const { user } = useAuth()

  const navItems = [
    {
      href: "/",
      icon: LayoutDashboard,
      label: "Dashboard",
      badge: null
    },
    {
      href: "/cases",
      icon: FolderOpen,
      label: "Cases",
      badge: 6
    },
    {
      href: "/alerts",
      icon: AlertTriangle,
      label: "Alerts",
      badge: null
    },
    {
      href: "/reports",
      icon: FileText,
      label: "Reports",
      badge: null
    },
    {
      href: "/databases",
      icon: Database,
      label: "Databases",
      badge: null
    },
    {
      href: "/settings",
      icon: Settings,
      label: "Settings",
      badge: null
    }
  ]

  if (user?.role === 'Super Admin') {
    navItems.splice(4, 0, {
      href: "/users",
      icon: Users,
      label: "Users",
      badge: null
    });
  }

  return (
    <div className="hidden border-r bg-card md:block fixed left-0 top-0 z-40 h-screen w-[220px] lg:w-[280px]">
      <div className="flex h-full flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:px-6">
          <Link href="/" className="flex items-center gap-3 font-semibold">
            <Image 
              src="/Logo_Cybermitra.svg" 
              alt="CyberMitra Logo" 
              width={32} 
              height={32}
              className="h-8 w-8"
            />
            <div className="flex flex-col">
              <span className="text-lg font-bold">Guardian</span>
              <span className="text-xs text-muted-foreground">CyberMitra</span>
            </div>
          </Link>
          <Button variant="outline" size="icon" className="ml-auto h-8 w-8">
            <Bell className="h-4 w-4" />
            <span className="sr-only">Toggle notifications</span>
          </Button>
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
                    {
                      "bg-muted text-primary": isActive,
                      "text-muted-foreground hover:text-primary": !isActive
                    }
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                  {item.badge && (
                    <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </div>
  )
} 