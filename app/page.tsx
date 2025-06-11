"use client"

import { useState } from "react"
import { MainLayout } from "@/components/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Car, Phone, Calendar, FileText } from "lucide-react"
import { mockVehicles, mockMaintenanceRecords, defaultMaintenanceItems } from "@/lib/data"
import type { Vehicle } from "@/types"

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Vehicle[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)

    // 模擬搜尋延遲
    setTimeout(() => {
      const results = mockVehicles.filter(
        (vehicle) =>
          vehicle.licensePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
          vehicle.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
          vehicle.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
          vehicle.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          vehicle.customerPhone.includes(searchQuery),
      )
      setSearchResults(results)
      setIsSearching(false)
    }, 500)
  }

  const getLatestMaintenance = (vehicleId: string) => {
    const records = mockMaintenanceRecords
      .filter((record) => record.vehicleId === vehicleId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return records[0]
  }

  return (
    <MainLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">汽車保養管理系統</h1>
          <p className="text-gray-600">搜尋車輛資料和保養記錄</p>
        </div>

        {/* 搜尋區域 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              車輛搜尋
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                placeholder="輸入車牌號碼、廠牌、車款、車主姓名或客戶電話..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch} disabled={isSearching}>
                {isSearching ? "搜尋中..." : "搜尋"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 搜尋結果 */}
        {searchResults.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">搜尋結果 ({searchResults.length})</h2>
            {searchResults.map((vehicle) => {
              const latestMaintenance = getLatestMaintenance(vehicle.id)
              const maintenanceItem = latestMaintenance
                ? defaultMaintenanceItems.find((item) => item.id === latestMaintenance.itemId)
                : null

              return (
                <Card key={vehicle.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Car className="h-5 w-5 text-blue-600" />
                          <h3 className="text-lg font-semibold">
                            {vehicle.brand} {vehicle.model}
                          </h3>
                          <Badge variant="outline">{vehicle.licensePlate}</Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            <span>{vehicle.customerPhone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{vehicle.manufactureYear}年</span>
                          </div>
                          <div>車主: {vehicle.ownerName}</div>
                          <div>引擎代碼: {vehicle.engineCode}</div>
                          <div>目前公里數: {vehicle.currentMileage.toLocaleString()} km</div>
                        </div>

                        {latestMaintenance && maintenanceItem && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm font-medium text-blue-800">最近保養: {maintenanceItem.name}</p>
                            <p className="text-xs text-blue-600">
                              {new Date(latestMaintenance.date).toLocaleDateString("zh-TW")} -
                              {latestMaintenance.mileage.toLocaleString()} km
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          查看詳情
                        </Button>
                        <Button size="sm">新增保養</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* 快速統計 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">總車輛數</p>
                  <p className="text-2xl font-bold">{mockVehicles.length}</p>
                </div>
                <Car className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">保養項目</p>
                  <p className="text-2xl font-bold">{defaultMaintenanceItems.length}</p>
                </div>
                <Search className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">保養記錄</p>
                  <p className="text-2xl font-bold">{mockMaintenanceRecords.length}</p>
                </div>
                <FileText className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
