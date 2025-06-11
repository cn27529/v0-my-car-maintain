"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { MainLayout } from "@/components/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Edit, Car, Phone, Users, Grid, List, Search, Calendar } from "lucide-react"
import { mockVehicles, mockMaintenanceRecords, defaultMaintenanceItems } from "@/lib/data"
import type { Vehicle } from "@/types"
import Link from "next/link"

interface OwnerGroup {
  ownerName: string
  customerPhone: string
  vehicles: Vehicle[]
  totalVehicles: number
  totalMaintenance: number
  latestMaintenance?: Date
}

type ViewMode = "all" | "grouped"

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(mockVehicles)
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<ViewMode>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)
  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    engineCode: "",
    currentMileage: "",
    licensePlate: "",
    ownerName: "",
    customerPhone: "",
    manufactureYear: "",
  })

  // 搜尋過濾
  const filteredVehicles = useMemo(() => {
    if (!searchQuery.trim()) return vehicles

    const query = searchQuery.toLowerCase()
    return vehicles.filter(
      (vehicle) =>
        vehicle.licensePlate.toLowerCase().includes(query) ||
        vehicle.brand.toLowerCase().includes(query) ||
        vehicle.model.toLowerCase().includes(query) ||
        vehicle.ownerName.toLowerCase().includes(query) ||
        vehicle.customerPhone.includes(query),
    )
  }, [vehicles, searchQuery])

  // 按車主分組
  const ownerGroups = useMemo(() => {
    const groups = new Map<string, OwnerGroup>()

    filteredVehicles.forEach((vehicle) => {
      const key = `${vehicle.ownerName}-${vehicle.customerPhone}`

      if (groups.has(key)) {
        const group = groups.get(key)!
        group.vehicles.push(vehicle)
        group.totalVehicles += 1
      } else {
        // 計算該車主所有車輛的保養記錄數
        const ownerVehicleIds = vehicles
          .filter((v) => v.ownerName === vehicle.ownerName && v.customerPhone === vehicle.customerPhone)
          .map((v) => v.id)

        const maintenanceCount = mockMaintenanceRecords.filter((record) =>
          ownerVehicleIds.includes(record.vehicleId),
        ).length

        // 找最新保養記錄
        const latestMaintenanceRecord = mockMaintenanceRecords
          .filter((record) => ownerVehicleIds.includes(record.vehicleId))
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]

        groups.set(key, {
          ownerName: vehicle.ownerName,
          customerPhone: vehicle.customerPhone,
          vehicles: [vehicle],
          totalVehicles: 1,
          totalMaintenance: maintenanceCount,
          latestMaintenance: latestMaintenanceRecord ? new Date(latestMaintenanceRecord.date) : undefined,
        })
      }
    })

    return Array.from(groups.values()).sort((a, b) => b.totalVehicles - a.totalVehicles)
  }, [filteredVehicles, vehicles])

  // 多車主統計
  const multiVehicleOwners = ownerGroups.filter((group) => group.totalVehicles > 1)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const vehicleData = {
      ...formData,
      currentMileage: Number.parseInt(formData.currentMileage),
      manufactureYear: Number.parseInt(formData.manufactureYear),
    }

    if (editingVehicle) {
      // 更新車輛
      setVehicles(
        vehicles.map((v) => (v.id === editingVehicle.id ? { ...v, ...vehicleData, updatedAt: new Date() } : v)),
      )
    } else {
      // 新增車輛
      const newVehicle: Vehicle = {
        id: Date.now().toString(),
        ...vehicleData,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      setVehicles([...vehicles, newVehicle])
    }

    setIsDialogOpen(false)
    setEditingVehicle(null)
    setFormData({
      brand: "",
      model: "",
      engineCode: "",
      currentMileage: "",
      licensePlate: "",
      ownerName: "",
      customerPhone: "",
      manufactureYear: "",
    })
  }

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle)
    setFormData({
      brand: vehicle.brand,
      model: vehicle.model,
      engineCode: vehicle.engineCode,
      currentMileage: vehicle.currentMileage.toString(),
      licensePlate: vehicle.licensePlate,
      ownerName: vehicle.ownerName,
      customerPhone: vehicle.customerPhone,
      manufactureYear: vehicle.manufactureYear.toString(),
    })
    setIsDialogOpen(true)
  }

  const getLatestMaintenance = (vehicleId: string) => {
    const records = mockMaintenanceRecords
      .filter((record) => record.vehicleId === vehicleId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return records[0]
  }

  const VehicleCard = ({ vehicle }: { vehicle: Vehicle }) => {
    const latestMaintenance = getLatestMaintenance(vehicle.id)
    const maintenanceItem = latestMaintenance
      ? defaultMaintenanceItems.find((item) => item.id === latestMaintenance.itemId)
      : null

    return (
      <Card className="hover:shadow-md transition-shadow">
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

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>{vehicle.customerPhone}</span>
                </div>
                <div>車主: {vehicle.ownerName}</div>
                <div>出廠年份: {vehicle.manufactureYear}</div>
                <div>引擎代碼: {vehicle.engineCode}</div>
                <div>公里數: {vehicle.currentMileage.toLocaleString()} km</div>
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
              <Link href={`/vehicles/${vehicle.id}/new-maintenance`}>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  新保養
                </Button>
              </Link>
              <Link href={`/vehicles/${vehicle.id}/maintenance-history`}>
                <Button variant="outline" size="sm">
                  查看保養記錄
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={() => handleEdit(vehicle)}>
                <Edit className="h-4 w-4 mr-2" />
                編輯
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <MainLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">車輛管理</h1>
            <p className="text-gray-600">管理所有車輛的基本資料</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                新增車輛
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingVehicle ? "編輯車輛" : "新增車輛"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="brand">廠牌</Label>
                    <Input
                      id="brand"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="model">車款</Label>
                    <Input
                      id="model"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="licensePlate">車牌號碼</Label>
                  <Input
                    id="licensePlate"
                    value={formData.licensePlate}
                    onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="ownerName">車主姓名</Label>
                  <Input
                    id="ownerName"
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="customerPhone">客戶電話</Label>
                  <Input
                    id="customerPhone"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="manufactureYear">出廠年份</Label>
                    <Input
                      id="manufactureYear"
                      type="number"
                      value={formData.manufactureYear}
                      onChange={(e) => setFormData({ ...formData, manufactureYear: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="currentMileage">目前公里數</Label>
                    <Input
                      id="currentMileage"
                      type="number"
                      value={formData.currentMileage}
                      onChange={(e) => setFormData({ ...formData, currentMileage: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="engineCode">引擎代碼</Label>
                  <Input
                    id="engineCode"
                    value={formData.engineCode}
                    onChange={(e) => setFormData({ ...formData, engineCode: e.target.value })}
                    required
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    取消
                  </Button>
                  <Button type="submit">{editingVehicle ? "更新" : "新增"}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* 搜尋區域 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              車輛搜尋
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="搜尋車牌號碼、廠牌、車款、車主姓名或客戶電話..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </CardContent>
        </Card>

        {/* 統計卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">總車輛數</p>
                  <p className="text-2xl font-bold">{filteredVehicles.length}</p>
                </div>
                <Car className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">車主數量</p>
                  <p className="text-2xl font-bold">{ownerGroups.length}</p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">多車主數</p>
                  <p className="text-2xl font-bold">{multiVehicleOwners.length}</p>
                </div>
                <Grid className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">保養記錄</p>
                  <p className="text-2xl font-bold">{mockMaintenanceRecords.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 視圖切換 */}
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              全部車輛
            </TabsTrigger>
            <TabsTrigger value="grouped" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              按車主分組
            </TabsTrigger>
          </TabsList>

          {/* 全部車輛視圖 */}
          <TabsContent value="all">
            <div className="space-y-4">
              {filteredVehicles.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">沒有找到符合條件的車輛</p>
                  </CardContent>
                </Card>
              ) : (
                filteredVehicles.map((vehicle) => <VehicleCard key={vehicle.id} vehicle={vehicle} />)
              )}
            </div>
          </TabsContent>

          {/* 按車主分組視圖 */}
          <TabsContent value="grouped">
            <div className="space-y-6">
              {ownerGroups.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">沒有找到符合條件的車主</p>
                  </CardContent>
                </Card>
              ) : (
                ownerGroups.map((group) => (
                  <Card key={`${group.ownerName}-${group.customerPhone}`} className="overflow-hidden">
                    <CardHeader className="bg-gray-50">
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-blue-600" />
                            {group.ownerName}
                            {group.totalVehicles > 1 && (
                              <Badge className="bg-blue-100 text-blue-800">{group.totalVehicles} 台車輛</Badge>
                            )}
                          </CardTitle>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            <div className="flex items-center gap-1">
                              <Phone className="h-4 w-4" />
                              {group.customerPhone}
                            </div>
                            <div>保養記錄: {group.totalMaintenance} 次</div>
                            {group.latestMaintenance && (
                              <div>最近保養: {group.latestMaintenance.toLocaleDateString("zh-TW")}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="space-y-4 p-6">
                        {group.vehicles.map((vehicle) => (
                          <VehicleCard key={vehicle.id} vehicle={vehicle} />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}
