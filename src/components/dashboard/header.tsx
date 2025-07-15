"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { clsx } from "clsx"
import {
  LayoutDashboard,
  FolderOpen,
  AlertTriangle,
  Package2,
  PanelLeft,
  Search,
  FileText,
  Settings,
} from "lucide-react"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import Image from "next/image"
import { useAuth } from "@/context/AuthContext"

export function Header() {
  const { logout } = useAuth()
  const pathname = usePathname()

  const getBreadcrumbs = () => {
    const pathSegments = pathname.split('/').filter(Boolean)
    
    const breadcrumbMap: Record<string, string> = {
      '': 'Dashboard',
      'cases': 'Cases',
      'alerts': 'Alerts',
      'reports': 'Reports',
      'settings': 'Settings'
    }

    if (pathSegments.length === 0) {
      return [{ label: 'Dashboard', href: '/', isActive: true }]
    }

    const breadcrumbs = [
      { label: 'Dashboard', href: '/', isActive: false }
    ]

    pathSegments.forEach((segment, index) => {
      const isLast = index === pathSegments.length - 1
      const href = '/' + pathSegments.slice(0, index + 1).join('/')
      const label = breadcrumbMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
      
      breadcrumbs.push({
        label,
        href,
        isActive: isLast
      })
    })

    return breadcrumbs
  }

  const breadcrumbs = getBreadcrumbs()

  const navItems = [
    { href: "/", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/cases", icon: FolderOpen, label: "Cases" },
    { href: "/alerts", icon: AlertTriangle, label: "Alerts" },
    { href: "/reports", icon: FileText, label: "Reports" },
    { href: "/settings", icon: Settings, label: "Settings" }
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 md:left-[220px] lg:left-[280px] md:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs">
          <nav className="grid gap-6 text-lg font-medium">
            <Link
              href="/"
              className="group flex items-center gap-3 font-semibold"
            >
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
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "flex items-center gap-4 px-2.5 transition-colors",
                    {
                      "text-foreground": isActive,
                      "text-muted-foreground hover:text-foreground": !isActive
                    }
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </SheetContent>
      </Sheet>
      
      <Breadcrumb className="hidden md:flex">
        <BreadcrumbList>
          {breadcrumbs.map((breadcrumb, index) => (
            <div key={breadcrumb.href} className="flex items-center">
              <BreadcrumbItem>
                {breadcrumb.isActive ? (
                  <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={breadcrumb.href}>{breadcrumb.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
            </div>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
      

      
      <div className="ml-auto flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="overflow-hidden rounded-full h-9 w-9"
            >
              <div className="flex items-center justify-center w-full h-full bg-black text-white font-semibold text-sm rounded-full">
                C
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>Support</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
} 