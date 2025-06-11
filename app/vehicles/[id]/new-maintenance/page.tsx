"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { MainLayout } from "@/components/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ArrowLeft, Car, User, Phone, Wrench, Save, ImageIcon } from "lucide-react"
import { mockVehicles, defaultMaintenanceItems } from "@/lib/data"
import type { Vehicle, MaintenanceRecord } from "@/types"

export default function NewMaintenancePage() {
  const params = useParams()
  const router = useRouter()
  const vehicleId = params.id as string

  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    itemId: "",
    date: new Date().toISOString().split("T")[0],
    mileage: "",
    technician: "",
    notes: "",
    cost: "",
    nextMaintenanceMileage: "",
  })

  useEffect(() => {
    const foundVehicle = mockVehicles.find((v) => v.id === vehicleId)
    if (foundVehicle) {
      setVehicle(foundVehicle)
      setFormData((prev) => ({
        ...prev,
        mileage: foundVehicle.currentMileage.toString(),
      }))
    }
  }, [vehicleId])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsConfirmDialogOpen(true)
  }

  const handleConfirm = () => {
    // 這裡會實際保存保養記錄
    const newRecord: MaintenanceRecord = {
      id: Date.now().toString(),
      vehicleId: vehicleId,
      itemId: formData.itemId,
      date: new Date(formData.date),
      mileage: Number.parseInt(formData.mileage),
      technician: formData.technician,
      notes: formData.notes,
      cost: formData.cost ? Number.parseInt(formData.cost) : undefined,
      nextMaintenanceMileage: formData.nextMaintenanceMileage
        ? Number.parseInt(formData.nextMaintenanceMileage)
        : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // 模擬保存到數據庫
    console.log("新增保養記錄:", newRecord)

    // 返回車輛保養記錄頁面
    router.push(`/vehicles/${vehicleId}/maintenance-history`)
  }

  const selectedItem = defaultMaintenanceItems.find((item) => item.id === formData.itemId)

  if (!vehicle) {
    return (
      <MainLayout>
        <div className="p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">車輛不存在</h1>
            <Button onClick={() => router.push("/vehicles")}>返回車輛列表</Button>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回
          </Button>
          <div>
            <h1 className="text-2xl font-bold">新增保養記錄</h1>
            <p className="text-gray-600">為車輛新增保養維護記錄</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 車輛資訊卡片 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                車輛資訊
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 車輛圖片 */}
              <div className="mb-4">
                {vehicle.image ? (
                  <img
                    src={vehicle.image || "/placeholder.svg"}
                    alt={`${vehicle.brand} ${vehicle.model}`}
                    className="w-full h-32 object-cover rounded border"
                  />
                ) : (
                  <div className="w-full h-32 bg-gray-100 rounded border flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-600">車輛</p>
                  <p className="font-medium">
                    {vehicle.brand} {vehicle.model}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">車牌</p>
                  <p className="font-medium">{vehicle.licensePlate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">引擎代碼</p>
                  <p className="font-medium">{vehicle.engineCode}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">目前公里數</p>
                  <p className="font-medium">{vehicle.currentMileage.toLocaleString()} km</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">車主</p>
                  <p className="font-medium flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {vehicle.ownerName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">聯絡電話</p>
                  <p className="font-medium flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {vehicle.customerPhone}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 保養記錄表單 */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                保養記錄詳情
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="itemId">保養項目 *</Label>
                    <Select
                      value={formData.itemId}
                      onValueChange={(value) => setFormData({ ...formData, itemId: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="選擇保養項目" />
                      </SelectTrigger>
                      <SelectContent>
                        {defaultMaintenanceItems.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name} ({item.category})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="date">保養日期 *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="mileage">保養時公里數 *</Label>
                    <Input
                      id="mileage"
                      type="number"
                      value={formData.mileage}
                      onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                      placeholder="例如：50000"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="technician">技師姓名</Label>
                    <Input
                      id="technician"
                      value={formData.technician}
                      onChange={(e) => setFormData({ ...formData, technician: e.target.value })}
                      placeholder="例如：張師傅"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cost">保養費用</Label>
                    <Input
                      id="cost"
                      type="number"
                      value={formData.cost}
                      onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                      placeholder="例如：1200"
                    />
                  </div>

                  <div>
                    <Label htmlFor="nextMaintenanceMileage">下次保養公里數</Label>
                    <Input
                      id="nextMaintenanceMileage"
                      type="number"
                      value={formData.nextMaintenanceMileage}
                      onChange={(e) => setFormData({ ...formData, nextMaintenanceMileage: e.target.value })}
                      placeholder="例如：55000"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">保養備註</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="記錄保養過程中的發現、建議或特殊情況..."
                    rows={4}
                  />
                </div>

                {selectedItem && (
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <h4 className="font-medium text-blue-900 mb-2">保養項目說明</h4>
                      <p className="text-blue-800 text-sm">{selectedItem.description}</p>
                    </CardContent>
                  </Card>
                )}

                <div className="flex justify-end gap-4">
                  <Button type="button" variant="outline" onClick={() => router.back()}>
                    取消
                  </Button>
                  <Button type="submit">
                    <Save className="h-4 w-4 mr-2" />
                    儲存保養記錄
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* 確認對話框 */}
        <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>確認新增保養記錄</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* 車輛圖片 */}
              {vehicle.image && (
                <div className="mb-4">
                  <img
                    src={vehicle.image || "/placeholder.svg"}
                    alt={`${vehicle.brand} ${vehicle.model}`}
                    className="w-full h-24 object-cover rounded border"
                  />
                </div>
              )}

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">車輛：</span>
                  <span className="font-medium">
                    {vehicle.brand} {vehicle.model}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">車牌：</span>
                  <span className="font-medium">{vehicle.licensePlate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">保養項目：</span>
                  <span className="font-medium">{selectedItem?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">保養日期：</span>
                  <span className="font-medium">{formData.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">公里數：</span>
                  <span className="font-medium">{Number.parseInt(formData.mileage).toLocaleString()} km</span>
                </div>
                {formData.technician && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">技師：</span>
                    <span className="font-medium">{formData.technician}</span>
                  </div>
                )}
                {formData.cost && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">費用：</span>
                    <span className="font-medium">NT$ {Number.parseInt(formData.cost).toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)}>
                  取消
                </Button>
                <Button onClick={handleConfirm}>確認新增</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}
