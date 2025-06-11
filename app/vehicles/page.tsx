"use client"

import type React from "react"
import { useState } from "react"
import { MainLayout } from "@/components/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileUpload } from "@/components/ui/file-upload"
import { Plus, Edit, Trash2, Car, Search, Calendar, Phone, User, ImageIcon } from "lucide-react"
import { mockVehicles } from "@/lib/data"
import type { Vehicle } from "@/types"

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(mockVehicles)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedOwner, setSelectedOwner] = useState<string>("all")
  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    engineCode: "",
    currentMileage: "",
    licensePlate: "",
    ownerName: "",
    customerPhone: "",
    manufactureYear: "",
    image: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingVehicle) {
      // 更新車輛
      setVehicles(
        vehicles.map((vehicle) =>
          vehicle.id === editingVehicle.id
            ? {
                ...vehicle,
                brand: formData.brand,
                model: formData.model,
                engineCode: formData.engineCode,
                currentMileage: Number.parseInt(formData.currentMileage),
                licensePlate: formData.licensePlate,
                ownerName: formData.ownerName,
                customerPhone: formData.customerPhone,
                manufactureYear: Number.parseInt(formData.manufactureYear),
                image: formData.image,
                updatedAt: new Date(),
              }
            : vehicle,
        ),
      )
    } else {
      // 新增車輛
      const newVehicle: Vehicle = {
        id: Date.now().toString(),
        brand: formData.brand,
        model: formData.model,
        engineCode: formData.engineCode,
        currentMileage: Number.parseInt(formData.currentMileage),
        licensePlate: formData.licensePlate,
        ownerName: formData.ownerName,
        customerPhone: formData.customerPhone,
        manufactureYear: Number.parseInt(formData.manufactureYear),
        image: formData.image,
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
      image: "",
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
      image: vehicle.image || "",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (vehicleId: string) => {
    if (confirm("確定要刪除這台車輛嗎？")) {
      setVehicles(vehicles.filter((vehicle) => vehicle.id !== vehicleId))
    }
  }

  const handleImageUpload = (base64: string) => {
    setFormData({ ...formData, image: base64 })
  }

  // 搜尋和篩選邏輯
  const uniqueOwners = Array.from(new Set(vehicles.map((v) => v.ownerName)))

  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesSearch =
      vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.ownerName.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesOwner = selectedOwner === "all" || vehicle.ownerName === selectedOwner

    return matchesSearch && matchesOwner
  })

  // 按車主分組
  const groupedVehicles = uniqueOwners.reduce(
    (acc, owner) => {
      const ownerVehicles = filteredVehicles.filter((v) => v.ownerName === owner)
      if (ownerVehicles.length > 0) {
        acc[owner] = ownerVehicles
      }
      return acc
    },
    {} as Record<string, Vehicle[]>,
  )

  return (
    <MainLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">車輛管理</h1>
            <p className="text-gray-600">管理所有車輛資訊和車主資料</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                新增車輛
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
                      placeholder="例如：Toyota"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="model">車款</Label>
                    <Input
                      id="model"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      placeholder="例如：Camry"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="engineCode">引擎代碼</Label>
                    <Input
                      id="engineCode"
                      value={formData.engineCode}
                      onChange={(e) => setFormData({ ...formData, engineCode: e.target.value })}
                      placeholder="例如：2AR-FE"
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
                      placeholder="例如：50000"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="licensePlate">車牌號碼</Label>
                    <Input
                      id="licensePlate"
                      value={formData.licensePlate}
                      onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                      placeholder="例如：ABC-1234"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="manufactureYear">出廠年份</Label>
                    <Input
                      id="manufactureYear"
                      type="number"
                      value={formData.manufactureYear}
                      onChange={(e) => setFormData({ ...formData, manufactureYear: e.target.value })}
                      placeholder="例如：2020"
                      min="1990"
                      max={new Date().getFullYear()}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ownerName">車主姓名</Label>
                    <Input
                      id="ownerName"
                      value={formData.ownerName}
                      onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                      placeholder="例如：王小明"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="customerPhone">聯絡電話</Label>
                    <Input
                      id="customerPhone"
                      value={formData.customerPhone}
                      onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                      placeholder="例如：0912-345-678"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="image">車輛圖片</Label>
                  <FileUpload
                    onUpload={handleImageUpload}
                    accept="image/*"
                    maxSize={2 * 1024 * 1024} // 2MB
                    preview={formData.image}
                  />
                  {formData.image && (
                    <div className="mt-2">
                      <img
                        src={formData.image || "/placeholder.svg"}
                        alt="車輛預覽"
                        className="w-32 h-24 object-cover rounded border"
                      />
                    </div>
                  )}
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

        {/* 搜尋和篩選 */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="搜尋車輛（廠牌、車款、車牌、車主）"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-48">
                <Select value={selectedOwner} onValueChange={setSelectedOwner}>
                  <SelectTrigger>
                    <SelectValue placeholder="選擇車主" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有車主</SelectItem>
                    {uniqueOwners.map((owner) => (
                      <SelectItem key={owner} value={owner}>
                        {owner}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 統計資訊 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">總車輛數</p>
                  <p className="text-2xl font-bold">{vehicles.length}</p>
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
                  <p className="text-2xl font-bold">{uniqueOwners.length}</p>
                </div>
                <User className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">多車車主</p>
                  <p className="text-2xl font-bold">
                    {Object.values(groupedVehicles).filter((vehicles) => vehicles.length > 1).length}
                  </p>
                </div>
                <Car className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">搜尋結果</p>
                  <p className="text-2xl font-bold">{filteredVehicles.length}</p>
                </div>
                <Search className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 車輛列表 - 按車主分組 */}
        <div className="space-y-6">
          {Object.entries(groupedVehicles).map(([owner, ownerVehicles]) => (
            <Card key={owner}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {owner}
                  <Badge variant="secondary">{ownerVehicles.length} 台車輛</Badge>
                  {ownerVehicles.length > 1 && (
                    <Badge variant="outline" className="text-purple-600 border-purple-600">
                      多車車主
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {ownerVehicles.map((vehicle) => (
                    <Card key={vehicle.id} className="border border-gray-200">
                      <CardContent className="p-4">
                        {/* 車輛圖片 */}
                        <div className="mb-3">
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
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-lg">
                              {vehicle.brand} {vehicle.model}
                            </h3>
                            <Badge variant="outline">{vehicle.manufactureYear}</Badge>
                          </div>

                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Car className="h-4 w-4" />
                              <span>{vehicle.licensePlate}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              <span>{vehicle.customerPhone}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>{vehicle.currentMileage.toLocaleString()} km</span>
                            </div>
                          </div>

                          <div className="flex gap-2 pt-2">
                            <Button variant="outline" size="sm" onClick={() => handleEdit(vehicle)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDelete(vehicle.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => (window.location.href = `/vehicles/${vehicle.id}/maintenance-history`)}
                            >
                              保養記錄
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredVehicles.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">沒有找到車輛</h3>
              <p className="text-gray-600">請調整搜尋條件或新增車輛</p>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  )
}
