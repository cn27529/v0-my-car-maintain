"use client"

import type React from "react"
import { useState } from "react"
import { MainLayout } from "@/components/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ColorPicker } from "@/components/ui/color-picker"
import { FileUpload } from "@/components/ui/file-upload"
import { useSettings } from "@/contexts/settings-context"
import {
  Palette,
  Building,
  Globe,
  Bell,
  Database,
  Download,
  Upload,
  RotateCcw,
  Save,
  Moon,
  Sun,
  Monitor,
} from "lucide-react"

export default function SettingsPage() {
  const { settings, updateSettings, resetSettings, exportSettings, importSettings } = useSettings()
  const [hasChanges, setHasChanges] = useState(false)

  const handleSettingChange = (key: string, value: any) => {
    updateSettings({ [key]: value })
    setHasChanges(true)
  }

  const handleNestedSettingChange = (parentKey: string, childKey: string, value: any) => {
    updateSettings({
      [parentKey]: {
        ...settings[parentKey as keyof typeof settings],
        [childKey]: value,
      },
    })
    setHasChanges(true)
  }

  const handleSave = () => {
    // 設定會自動保存到 localStorage，這裡可以添加額外的保存邏輯
    setHasChanges(false)
    alert("設定已保存！")
  }

  const handleLogoUpload = (file: File | null) => {
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        handleSettingChange("logo", result)
      }
      reader.readAsDataURL(file)
    } else {
      handleSettingChange("logo", null)
    }
  }

  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target?.result as string)
          importSettings(importedSettings)
          setHasChanges(true)
          alert("設定已匯入！")
        } catch (error) {
          alert("匯入失敗：文件格式錯誤")
        }
      }
      reader.readAsText(file)
    }
  }

  const getThemeIcon = (theme: string) => {
    switch (theme) {
      case "light":
        return <Sun className="w-4 h-4" />
      case "dark":
        return <Moon className="w-4 h-4" />
      default:
        return <Monitor className="w-4 h-4" />
    }
  }

  return (
    <MainLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">系統設定</h1>
            <p className="text-gray-600">自定義系統外觀和功能設定</p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={exportSettings}>
              <Download className="w-4 h-4 mr-2" />
              匯出設定
            </Button>
            <label>
              <Button variant="outline" asChild>
                <span>
                  <Upload className="w-4 h-4 mr-2" />
                  匯入設定
                </span>
              </Button>
              <input type="file" accept=".json" className="hidden" onChange={handleImportSettings} />
            </label>
            {hasChanges && (
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                保存設定
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue="appearance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              外觀設定
            </TabsTrigger>
            <TabsTrigger value="company" className="flex items-center gap-2">
              <Building className="w-4 h-4" />
              公司資訊
            </TabsTrigger>
            <TabsTrigger value="regional" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              地區設定
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              通知設定
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              數據管理
            </TabsTrigger>
          </TabsList>

          {/* 外觀設定 */}
          <TabsContent value="appearance">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>系統外觀</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="systemName">系統名稱</Label>
                    <Input
                      id="systemName"
                      value={settings.systemName}
                      onChange={(e) => handleSettingChange("systemName", e.target.value)}
                      placeholder="輸入系統名稱"
                    />
                  </div>

                  <div>
                    <Label>系統 Logo</Label>
                    <FileUpload
                      accept="image/*"
                      maxSize={2}
                      onFileSelect={handleLogoUpload}
                      currentFile={settings.logo}
                      placeholder="上傳 Logo 圖片 (最大 2MB)"
                    />
                    {settings.logo && (
                      <div className="mt-2">
                        <img
                          src={settings.logo || "/placeholder.svg"}
                          alt="Logo Preview"
                          className="max-w-32 max-h-16 object-contain border rounded"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <Label>主題模式</Label>
                    <Select
                      value={settings.theme}
                      onValueChange={(value: "light" | "dark" | "system") => handleSettingChange("theme", value)}
                    >
                      <SelectTrigger>
                        <div className="flex items-center gap-2">
                          {getThemeIcon(settings.theme)}
                          <SelectValue />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">
                          <div className="flex items-center gap-2">
                            <Sun className="w-4 h-4" />
                            淺色模式
                          </div>
                        </SelectItem>
                        <SelectItem value="dark">
                          <div className="flex items-center gap-2">
                            <Moon className="w-4 h-4" />
                            深色模式
                          </div>
                        </SelectItem>
                        <SelectItem value="system">
                          <div className="flex items-center gap-2">
                            <Monitor className="w-4 h-4" />
                            跟隨系統
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>主要顏色</Label>
                    <ColorPicker
                      color={settings.primaryColor}
                      onChange={(color) => handleSettingChange("primaryColor", color)}
                    />
                  </div>

                  <div>
                    <Label>背景顏色</Label>
                    <ColorPicker
                      color={settings.backgroundColor}
                      onChange={(color) => handleSettingChange("backgroundColor", color)}
                      presetColors={[
                        "#ffffff",
                        "#f8fafc",
                        "#f1f5f9",
                        "#e2e8f0",
                        "#1e293b",
                        "#334155",
                        "#475569",
                        "#64748b",
                      ]}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 公司資訊 */}
          <TabsContent value="company">
            <Card>
              <CardHeader>
                <CardTitle>公司基本資訊</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="companyName">公司名稱</Label>
                  <Input
                    id="companyName"
                    value={settings.companyInfo.name}
                    onChange={(e) => handleNestedSettingChange("companyInfo", "name", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="companyAddress">公司地址</Label>
                  <Textarea
                    id="companyAddress"
                    value={settings.companyInfo.address}
                    onChange={(e) => handleNestedSettingChange("companyInfo", "address", e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="companyPhone">聯絡電話</Label>
                    <Input
                      id="companyPhone"
                      value={settings.companyInfo.phone}
                      onChange={(e) => handleNestedSettingChange("companyInfo", "phone", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="companyEmail">電子郵件</Label>
                    <Input
                      id="companyEmail"
                      type="email"
                      value={settings.companyInfo.email}
                      onChange={(e) => handleNestedSettingChange("companyInfo", "email", e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="companyWebsite">公司網站</Label>
                  <Input
                    id="companyWebsite"
                    value={settings.companyInfo.website}
                    onChange={(e) => handleNestedSettingChange("companyInfo", "website", e.target.value)}
                    placeholder="https://www.example.com"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 地區設定 */}
          <TabsContent value="regional">
            <Card>
              <CardHeader>
                <CardTitle>地區和語言設定</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>語言</Label>
                    <Select
                      value={settings.language}
                      onValueChange={(value: "zh-TW" | "zh-CN" | "en-US") => handleSettingChange("language", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="zh-TW">繁體中文</SelectItem>
                        <SelectItem value="zh-CN">简体中文</SelectItem>
                        <SelectItem value="en-US">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>時區</Label>
                    <Select value={settings.timezone} onValueChange={(value) => handleSettingChange("timezone", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Taipei">台北 (GMT+8)</SelectItem>
                        <SelectItem value="Asia/Shanghai">上海 (GMT+8)</SelectItem>
                        <SelectItem value="Asia/Tokyo">東京 (GMT+9)</SelectItem>
                        <SelectItem value="America/New_York">紐約 (GMT-5)</SelectItem>
                        <SelectItem value="Europe/London">倫敦 (GMT+0)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>貨幣</Label>
                    <Select value={settings.currency} onValueChange={(value) => handleSettingChange("currency", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TWD">新台幣 (TWD)</SelectItem>
                        <SelectItem value="CNY">人民幣 (CNY)</SelectItem>
                        <SelectItem value="USD">美元 (USD)</SelectItem>
                        <SelectItem value="JPY">日圓 (JPY)</SelectItem>
                        <SelectItem value="EUR">歐元 (EUR)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>日期格式</Label>
                    <Select
                      value={settings.dateFormat}
                      onValueChange={(value: "YYYY/MM/DD" | "DD/MM/YYYY" | "MM/DD/YYYY") =>
                        handleSettingChange("dateFormat", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="YYYY/MM/DD">年/月/日</SelectItem>
                        <SelectItem value="DD/MM/YYYY">日/月/年</SelectItem>
                        <SelectItem value="MM/DD/YYYY">月/日/年</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 通知設定 */}
          <TabsContent value="notifications">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>通知偏好設定</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>電子郵件通知</Label>
                      <p className="text-sm text-gray-600">接收重要系統通知的電子郵件</p>
                    </div>
                    <Switch
                      checked={settings.notifications.email}
                      onCheckedChange={(checked) => handleNestedSettingChange("notifications", "email", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>瀏覽器通知</Label>
                      <p className="text-sm text-gray-600">在瀏覽器中顯示即時通知</p>
                    </div>
                    <Switch
                      checked={settings.notifications.browser}
                      onCheckedChange={(checked) => handleNestedSettingChange("notifications", "browser", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>保養提醒</Label>
                      <p className="text-sm text-gray-600">車輛保養到期提醒</p>
                    </div>
                    <Switch
                      checked={settings.notifications.maintenance}
                      onCheckedChange={(checked) => handleNestedSettingChange("notifications", "maintenance", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>系統提醒</Label>
                      <p className="text-sm text-gray-600">系統更新和維護提醒</p>
                    </div>
                    <Switch
                      checked={settings.notifications.reminders}
                      onCheckedChange={(checked) => handleNestedSettingChange("notifications", "reminders", checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>自動保存設定</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>啟用自動保存</Label>
                      <p className="text-sm text-gray-600">自動保存用戶輸入的數據</p>
                    </div>
                    <Switch
                      checked={settings.autoSave}
                      onCheckedChange={(checked) => handleSettingChange("autoSave", checked)}
                    />
                  </div>

                  {settings.autoSave && (
                    <div>
                      <Label>自動保存間隔 (分鐘)</Label>
                      <Select
                        value={settings.autoSaveInterval.toString()}
                        onValueChange={(value) => handleSettingChange("autoSaveInterval", Number.parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 分鐘</SelectItem>
                          <SelectItem value="5">5 分鐘</SelectItem>
                          <SelectItem value="10">10 分鐘</SelectItem>
                          <SelectItem value="15">15 分鐘</SelectItem>
                          <SelectItem value="30">30 分鐘</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 數據管理 */}
          <TabsContent value="data">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>數據備份設定</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>啟用自動備份</Label>
                      <p className="text-sm text-gray-600">定期自動備份系統數據</p>
                    </div>
                    <Switch
                      checked={settings.backupEnabled}
                      onCheckedChange={(checked) => handleSettingChange("backupEnabled", checked)}
                    />
                  </div>

                  {settings.backupEnabled && (
                    <div>
                      <Label>備份頻率</Label>
                      <Select
                        value={settings.backupInterval}
                        onValueChange={(value: "daily" | "weekly" | "monthly") =>
                          handleSettingChange("backupInterval", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">每日</SelectItem>
                          <SelectItem value="weekly">每週</SelectItem>
                          <SelectItem value="monthly">每月</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div>
                    <Label>數據保留期限 (月)</Label>
                    <Select
                      value={settings.dataRetention.toString()}
                      onValueChange={(value) => handleSettingChange("dataRetention", Number.parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12">12 個月</SelectItem>
                        <SelectItem value="24">24 個月</SelectItem>
                        <SelectItem value="36">36 個月</SelectItem>
                        <SelectItem value="60">60 個月</SelectItem>
                        <SelectItem value="0">永久保留</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>系統重置</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">重置所有設定到預設值。此操作無法復原，請謹慎使用。</p>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        if (confirm("確定要重置所有設定嗎？此操作無法復原。")) {
                          resetSettings()
                          setHasChanges(false)
                          alert("設定已重置！")
                        }
                      }}
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      重置所有設定
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}
