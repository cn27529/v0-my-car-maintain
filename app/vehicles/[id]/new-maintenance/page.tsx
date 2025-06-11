"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { MainLayout } from "@/components/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { ArrowLeft, Car, Save, X, Wrench } from "lucide-react"
import { mockVehicles, defaultMaintenanceItems } from "@/lib/data"
import type { Vehicle, MaintenanceItem, MaintenanceRecord } from "@/types"

export default function NewMaintenancePage() {
  const params = useParams()
  const router = useRouter()
  const vehicleId = params.id as string

  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [formData, setFormData] = useState({
    mileage: "",
    technician: "",
    cost: "",
    notes: "",
    date: new Date().toISOString().slice(0, 16), // 自動產生當前日期時間
  })

  useEffect(() => {
    // 查找車輛資料
    const foundVehicle = mockVehicles.find((v) => v.id === vehicleId)
    if (foundVehicle) {
      setVehicle(foundVehicle)
      // 預設公里數為車輛當前公里數
      setFormData((prev) => ({
        ...prev,
        mileage: foundVehicle.currentMileage.toString(),
      }))
    }
  }, [vehicleId])

  const handleItemToggle = (itemId: string) => {
    setSelectedItems((prev) => (prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedItems.length === 0) {
      alert("請至少選擇一個保養項目")
      return
    }
    setShowConfirmDialog(true)
  }

  const handleConfirmSave = () => {
    // 為每個選中的保養項目創建記錄
    const newRecords: MaintenanceRecord[] = selectedItems.map((itemId) => ({
      id: `${Date.now()}-${itemId}`,
      vehicleId: vehicleId,
      itemId: itemId,
      date: new Date(formData.date),
      mileage: Number.parseInt(formData.mileage),
      technician: formData.technician,
      notes: formData.notes,
      cost: formData.cost ? Number.parseFloat(formData.cost) : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    }))

    // 這裡應該保存到數據庫，現在只是模擬
    console.log("保存保養記錄:", newRecords)

    // 更新車輛的當前公里數
    if (vehicle) {
      const updatedMileage = Number.parseInt(formData.mileage)
      if (updatedMileage > vehicle.currentMileage) {
        // 這裡應該更新車輛的公里數
        console.log("更新車輛公里數:", updatedMileage)
      }
    }

    setShowConfirmDialog(false)

    // 顯示成功訊息並跳轉
    alert(`成功新增 ${selectedItems.length} 項保養記錄！`)
    router.push(`/vehicles/${vehicleId}/maintenance-history`)
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      引擎: "bg-red-100 text-red-800",
      傳動: "bg-blue-100 text-blue-800",
      冷卻: "bg-cyan-100 text-cyan-800",
      電氣: "bg-yellow-100 text-yellow-800",
      懸吊: "bg-purple-100 text-purple-800",
      煞車: "bg-orange-100 text-orange-800",
      濾清: "bg-green-100 text-green-800",
    }
    return colors[category] || "bg-gray-100 text-gray-800"
  }

  const groupedItems = defaultMaintenanceItems.reduce(
    (groups, item) => {
      const category = item.category
      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(item)
      return groups
    },
    {} as Record<string, MaintenanceItem[]>,
  )

  const totalCost = formData.cost ? Number.parseFloat(formData.cost) : 0

  if (!vehicle) {
    return (
      <MainLayout>
        <div className="p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">車輛不存在</h1>
            <Button onClick={() => router.back()} className="mt-4">
              返回
            </Button>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="p-6">
        <div className="mb-6">
          <Button variant="outline" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回車輛管理
          </Button>

          <h1 className="text-2xl font-bold mb-4">新增保養記錄</h1>

          {/* 車輛基本資訊 */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5 text-blue-600" />
                車輛資訊
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">車輛</p>
                  <p className="font-semibold">
                    {vehicle.brand} {vehicle.model}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">車牌</p>
                  <p className="font-semibold">{vehicle.licensePlate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">車主</p>
                  <p className="font-semibold">{vehicle.ownerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">目前公里數</p>
                  <p className="font-semibold">{vehicle.currentMileage.toLocaleString()} km</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">客戶電話</p>
                  <p className="font-semibold">{vehicle.customerPhone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">出廠年份</p>
                  <p className="font-semibold">{vehicle.manufactureYear}年</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">引擎代碼</p>
                  <p className="font-semibold">{vehicle.engineCode}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 保養記錄表單 */}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 保養項目選擇 */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5" />
                    選擇保養項目
                  </CardTitle>
                  <p className="text-sm text-gray-600">已選擇 {selectedItems.length} 項保養項目</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {Object.entries(groupedItems).map(([category, items]) => (
                      <div key={category}>
                        <h3 className="font-medium mb-3 flex items-center gap-2">
                          <Badge className={getCategoryColor(category)}>{category}</Badge>
                          <span className="text-sm text-gray-500">({items.length} 項目)</span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50"
                            >
                              <Checkbox
                                id={item.id}
                                checked={selectedItems.includes(item.id)}
                                onCheckedChange={() => handleItemToggle(item.id)}
                              />
                              <div className="flex-1">
                                <Label htmlFor={item.id} className="font-medium cursor-pointer">
                                  {item.name}
                                </Label>
                                {item.description && <p className="text-xs text-gray-500 mt-1">{item.description}</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 保養詳情 */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>保養詳情</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="date">保養日期時間</Label>
                    <Input
                      id="date"
                      type="datetime-local"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="mileage">保養公里數</Label>
                    <Input
                      id="mileage"
                      type="number"
                      value={formData.mileage}
                      onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                      placeholder="輸入保養時的公里數"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="technician">保養人員</Label>
                    <Input
                      id="technician"
                      value={formData.technician}
                      onChange={(e) => setFormData({ ...formData, technician: e.target.value })}
                      placeholder="輸入保養人員姓名"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cost">保養金額</Label>
                    <Input
                      id="cost"
                      type="number"
                      step="0.01"
                      value={formData.cost}
                      onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                      placeholder="輸入保養費用"
                    />
                    {totalCost > 0 && (
                      <p className="text-sm text-gray-600 mt-1">總金額: ${totalCost.toLocaleString()}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="notes">備註</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="輸入保養備註..."
                      rows={4}
                    />
                  </div>

                  {/* 操作按鈕 */}
                  <div className="flex gap-2 pt-4">
                    <Button type="submit" className="flex-1">
                      <Save className="h-4 w-4 mr-2" />
                      儲存保養記錄
                    </Button>
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                      <X className="h-4 w-4 mr-2" />
                      取消
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>

        {/* 確認對話框 */}
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>確認保存保養記錄</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="mb-4">您即將為以下車輛新增保養記錄：</p>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p>
                  <strong>車輛:</strong> {vehicle.brand} {vehicle.model} ({vehicle.licensePlate})
                </p>
                <p>
                  <strong>車主:</strong> {vehicle.ownerName}
                </p>
                <p>
                  <strong>保養日期:</strong> {new Date(formData.date).toLocaleString("zh-TW")}
                </p>
                <p>
                  <strong>保養公里數:</strong> {Number.parseInt(formData.mileage).toLocaleString()} km
                </p>
                {formData.technician && (
                  <p>
                    <strong>保養人員:</strong> {formData.technician}
                  </p>
                )}
                {formData.cost && (
                  <p>
                    <strong>保養金額:</strong> ${Number.parseFloat(formData.cost).toLocaleString()}
                  </p>
                )}
              </div>
              <p>
                <strong>保養項目 ({selectedItems.length} 項):</strong>
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                {selectedItems.map((itemId) => {
                  const item = defaultMaintenanceItems.find((i) => i.id === itemId)
                  return (
                    <li key={itemId} className="text-sm">
                      {item?.name}
                      <Badge className={`ml-2 ${getCategoryColor(item?.category || "")}`} variant="secondary">
                        {item?.category}
                      </Badge>
                    </li>
                  )
                })}
              </ul>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
                取消
              </Button>
              <Button onClick={handleConfirmSave}>確認保存</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}
