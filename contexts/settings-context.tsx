"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export interface SystemSettings {
  // 基本設定
  systemName: string
  logo: string | null
  companyInfo: {
    name: string
    address: string
    phone: string
    email: string
    website: string
  }

  // 外觀設定
  theme: "light" | "dark" | "system"
  primaryColor: string
  backgroundColor: string

  // 地區設定
  language: "zh-TW" | "zh-CN" | "en-US"
  timezone: string
  currency: string
  dateFormat: "YYYY/MM/DD" | "DD/MM/YYYY" | "MM/DD/YYYY"

  // 功能設定
  autoSave: boolean
  autoSaveInterval: number // 分鐘
  notifications: {
    email: boolean
    browser: boolean
    maintenance: boolean
    reminders: boolean
  }

  // 數據設定
  backupEnabled: boolean
  backupInterval: "daily" | "weekly" | "monthly"
  dataRetention: number // 月份
}

const defaultSettings: SystemSettings = {
  systemName: "汽車保養管理系統",
  logo: null,
  companyInfo: {
    name: "",
    address: "",
    phone: "",
    email: "",
    website: "",
  },
  theme: "light",
  primaryColor: "#3b82f6",
  backgroundColor: "#f8fafc",
  language: "zh-TW",
  timezone: "Asia/Taipei",
  currency: "TWD",
  dateFormat: "YYYY/MM/DD",
  autoSave: true,
  autoSaveInterval: 5,
  notifications: {
    email: true,
    browser: true,
    maintenance: true,
    reminders: true,
  },
  backupEnabled: true,
  backupInterval: "weekly",
  dataRetention: 24,
}

interface SettingsContextType {
  settings: SystemSettings
  updateSettings: (newSettings: Partial<SystemSettings>) => void
  resetSettings: () => void
  exportSettings: () => void
  importSettings: (settings: SystemSettings) => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings)

  // 從 localStorage 載入設定
  useEffect(() => {
    const savedSettings = localStorage.getItem("systemSettings")
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings({ ...defaultSettings, ...parsed })
      } catch (error) {
        console.error("Failed to parse saved settings:", error)
      }
    }
  }, [])

  // 保存設定到 localStorage
  useEffect(() => {
    localStorage.setItem("systemSettings", JSON.stringify(settings))

    // 應用主題
    const root = document.documentElement
    if (settings.theme === "dark") {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }

    // 應用顏色
    root.style.setProperty("--primary-color", settings.primaryColor)
    root.style.setProperty("--background-color", settings.backgroundColor)
  }, [settings])

  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }))
  }

  const resetSettings = () => {
    setSettings(defaultSettings)
    localStorage.removeItem("systemSettings")
  }

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = "system-settings.json"
    link.click()
    URL.revokeObjectURL(url)
  }

  const importSettings = (newSettings: SystemSettings) => {
    setSettings(newSettings)
  }

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        resetSettings,
        exportSettings,
        importSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}
