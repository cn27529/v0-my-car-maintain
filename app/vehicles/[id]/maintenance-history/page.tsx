"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { MainLayout } from "@/components/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, Wrench, DollarSign, Gauge } from "lucide-react"
import { mockVehicles, mockMaintenanceRecords, defaultMaintenanceItems } from "@/lib/data"
import type { Vehicle, MaintenanceRecord, MaintenanceItem } from "@/types"

interface MaintenanceRecordWithItem extends MaintenanceRecord {
  item: MaintenanceItem
}

export default function MaintenanceHistoryPage() {
  const params = useParams()
  const router = useRouter()
  const vehicleId = params.id as string

  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [maintenanceHistory, setMaintenanceHistory] = useState<MaintenanceRecordWithItem[]>([])

  useEffect(() => {
    // 查找車輛資料
    const foundVehicle = mockVehicles.find((v) => v.id === vehicleId)
    if (foundVehicle) {
      setVehicle(foundVehicle)
    }

    // 查找保養記錄
    const records = mockMaintenanceRecords
      .filter((record) => record.vehicleId === vehicleId)
      .map((record) => {
        const item = defaultMaintenanceItems.find((item) => item.id === record.itemId)
        return {
          ...record,
          item: item!,
        }
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    setMaintenanceHistory(records)
  }, [vehicleId])

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

  return (
    <MainLayout>
      <div className="p-6">
        <div className="mb-6">
          <Button variant="outline" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回車輛管理
          </Button>

          <div className="bg-white p-6 rounded-lg border">
            <h1 className="text-2xl font-bold mb-4">保養記錄</h1>

            {/* 車輛基本資訊 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
            </div>
          </div>
        </div>

        {/* 保養記錄統計 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">總保養次數</p>
                  <p className="text-2xl font-bold">{maintenanceHistory.length}</p>
                </div>
                <Wrench className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">總花費</p>
                  <p className="text-2xl font-bold">
                    ${maintenanceHistory.reduce((sum, record) => sum + (record.cost || 0), 0).toLocaleString()}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">最近保養</p>
                  <p className="text-2xl font-bold">
                    {maintenanceHistory.length > 0
                      ? new Date(maintenanceHistory[0].date).toLocaleDateString("zh-TW")
                      : "無記錄"}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 保養記錄列表 */}
        <Card>
          <CardHeader>
            <CardTitle>保養歷史記錄</CardTitle>
          </CardHeader>
          <CardContent>
            {maintenanceHistory.length === 0 ? (
              <div className="text-center py-8">
                <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">尚無保養記錄</p>
              </div>
            ) : (
              <div className="space-y-4">
                {maintenanceHistory.map((record) => (
                  <div key={record.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{record.item.name}</h3>
                          <Badge className={getCategoryColor(record.item.category)}>{record.item.category}</Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(record.date).toLocaleDateString("zh-TW")}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Gauge className="h-4 w-4" />
                            <span>{record.mileage.toLocaleString()} km</span>
                          </div>
                          {record.cost && (
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4" />
                              <span>${record.cost.toLocaleString()}</span>
                            </div>
                          )}
                          {record.nextMaintenanceMileage && (
                            <div className="text-blue-600">
                              下次保養: {record.nextMaintenanceMileage.toLocaleString()} km
                            </div>
                          )}
                        </div>

                        {record.notes && (
                          <div className="text-sm text-gray-700 bg-gray-100 p-2 rounded">
                            <strong>備註:</strong> {record.notes}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          編輯
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
