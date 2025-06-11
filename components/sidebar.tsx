"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Car,
  Home,
  Settings,
  FileText,
  ChevronLeft,
  ChevronRight,
  Wrench,
  History,
  Users,
  BarChart3,
} from "lucide-react"
import { useSettings } from "@/contexts/settings-context"

const menuItems = [
  { href: "/", label: "首頁", icon: Home },
  { href: "/vehicles", label: "車輛管理", icon: Car },
  { href: "/maintenance", label: "保養項目", icon: Wrench },
  { href: "/technicians", label: "技師維護", icon: Users },
  { href: "/records", label: "保養記錄", icon: FileText },
  { href: "/statistics", label: "保養數據統計", icon: BarChart3 },
  { href: "/history", label: "歷史查詢", icon: History },
  { href: "/settings", label: "系統設定", icon: Settings },
]

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { settings } = useSettings()
  const pathname = usePathname()

  return (
    <div
      className={cn("bg-slate-900 text-white transition-all duration-300 flex flex-col", isCollapsed ? "w-16" : "w-64")}
    >
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          {!isCollapsed && <h1 className="text-xl font-bold">{settings.systemName}</h1>}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-white hover:bg-slate-700"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                    isActive ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-700 hover:text-white",
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
