"use client"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { MainLayout } from "@/components/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Car, Calendar, User, Phone, Plus, Wrench, DollarSign } from "lucide-react"
import { ImageIcon } from "lucide-react"
import { mockVehicles, defaultMaintenanceItems, mockMaintenanceRecords } from "@/lib/data"
import type { Vehicle, MaintenanceItem, MaintenanceRecord } from "@/types"

export default function MaintenanceHistoryPage() {
  const params = useParams()
  const router = useRouter()
  const vehicleId = params.id as string

  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [records, setRecords] = useState<(MaintenanceRecord & { item: MaintenanceItem })[]>([])

  useEffect(() => {
    const foundVehicle = mockVehicles.find((v) => v.id === vehicleId)
    if (foundVehicle) {
      setVehicle(foundVehicle)
    }

    // 獲取該車輛的保養記錄
    const vehicleRecords = mockMaintenanceRecords
      .filter((record) => record.vehicleId === vehicleId)
      .map((record) => {
        const item = defaultMaintenanceItems.find((item) => item.id === record.itemId)
        return {
          ...record,
          item: item!,
        }
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    setRecords(vehicleRecords)
  }, [vehicleId])

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

  const totalCost = records.reduce((sum, record) => sum + (record.cost || 0), 0)
  const lastMaintenance = records[0]

  return (
    <MainLayout>
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => router.push("/vehicles")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回車輛列表
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">保養記錄</h1>
            <p className="text-gray-600">查看車輛的所有保養維護記錄</p>
          </div>
          <Button onClick={() => router.push(`/vehicles/${vehicleId}/new-maintenance`)}>
            <Plus className="h-4 w-4 mr-2" />
            新增保養記錄
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
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

          {/* 保養統計 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                保養統計
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">總保養次數</p>
                <p className="text-2xl font-bold">{records.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">總保養費用</p>
                <p className="text-2xl font-bold">NT$ {totalCost.toLocaleString()}</p>
              </div>
              {lastMaintenance && (
                <div>
                  <p className="text-sm text-gray-600">最後保養</p>
                  <p className="font-medium">{lastMaintenance.date.toLocaleDateString()}</p>
                  <p className="text-sm text-gray-500">{lastMaintenance.item.name}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 下次保養提醒 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                保養提醒
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {records
                .filter(
                  (record) => record.nextMaintenanceMileage && record.nextMaintenanceMileage > vehicle.currentMileage,
                )
                .slice(0, 3)
                .map((record) => (
                  <div key={record.id} className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="font-medium text-yellow-800">{record.item.name}</p>
                    <p className="text-sm text-yellow-600">
                      建議於 {record.nextMaintenanceMileage?.toLocaleString()} km 保養
                    </p>
                    <p className="text-xs text-yellow-500">
                      還有 {((record.nextMaintenanceMileage || 0) - vehicle.currentMileage).toLocaleString()} km
                    </p>
                  </div>
                ))}
              {records.filter(
                (record) => record.nextMaintenanceMileage && record.nextMaintenanceMileage > vehicle.currentMileage,
              ).length === 0 && <p className="text-gray-500 text-center py-4">暫無保養提醒</p>}
            </CardContent>
          </Card>
        </div>

        {/* 保養記錄列表 */}
        <Card>
          <CardHeader>
            <CardTitle>保養記錄明細</CardTitle>
          </CardHeader>
          <CardContent>
            {records.length === 0 ? (
              <div className="text-center py-8">
                <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">尚無保養記錄</h3>
                <p className="text-gray-600 mb-4">開始記錄這台車輛的保養維護情況</p>
                <Button onClick={() => router.push(`/vehicles/${vehicleId}/new-maintenance`)}>
                  <Plus className="h-4 w-4 mr-2" />
                  新增第一筆保養記錄
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {records.map((record) => (
                  <Card key={record.id} className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{record.item.name}</h3>
                            <Badge variant="outline">{record.item.category}</Badge>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">保養日期</p>
                              <p className="font-medium flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {record.date.toLocaleDateString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600">公里數</p>
                              <p className="font-medium">{record.mileage.toLocaleString()} km</p>
                            </div>
                            {record.technician && (
                              <div>
                                <p className="text-gray-600">技師</p>
                                <p className="font-medium">{record.technician}</p>
                              </div>
                            )}
                            {record.cost && (
                              <div>
                                <p className="text-gray-600">費用</p>
                                <p className="font-medium flex items-center gap-1">
                                  <DollarSign className="h-4 w-4" />
                                  NT$ {record.cost.toLocaleString()}
                                </p>
                              </div>
                            )}
                          </div>

                          {record.notes && (
                            <div className="mt-3 p-3 bg-gray-50 rounded">
                              <p className="text-sm text-gray-700">{record.notes}</p>
                            </div>
                          )}

                          {record.nextMaintenanceMileage && (
                            <div className="mt-2">
                              <p className="text-sm text-blue-600">
                                下次保養建議：{record.nextMaintenanceMileage.toLocaleString()} km
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
