"use client"

import { useState, useMemo } from "react"
import { MainLayout } from "@/components/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Search,
  Filter,
  Calendar,
  DollarSign,
  Wrench,
  Car,
  Phone,
  SortAsc,
  SortDesc,
  Grid,
  List,
  Download,
  RefreshCw,
  TrendingUp,
  BarChart3,
} from "lucide-react"
import { mockVehicles, mockMaintenanceRecords, defaultMaintenanceItems } from "@/lib/data"
import type { Vehicle, MaintenanceRecord, MaintenanceItem } from "@/types"

interface MaintenanceRecordWithDetails extends MaintenanceRecord {
  vehicle: Vehicle
  item: MaintenanceItem
}

type SortField = "date" | "mileage" | "cost" | "vehicle"
type SortOrder = "asc" | "desc"
type ViewMode = "grid" | "list"

export default function RecordsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [selectedTechnicians, setSelectedTechnicians] = useState<string[]>([])
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([])
  const [dateRange, setDateRange] = useState({ start: "", end: "" })
  const [costRange, setCostRange] = useState({ min: "", max: "" })
  const [mileageRange, setMileageRange] = useState({ min: "", max: "" })
  const [sortField, setSortField] = useState<SortField>("date")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  // 組合保養記錄與車輛、項目資訊
  const recordsWithDetails: MaintenanceRecordWithDetails[] = useMemo(() => {
    return mockMaintenanceRecords.map((record) => {
      const vehicle = mockVehicles.find((v) => v.id === record.vehicleId)!
      const item = defaultMaintenanceItems.find((i) => i.id === record.itemId)!
      return { ...record, vehicle, item }
    })
  }, [])

  // 獲取所有技師名單
  const allTechnicians = useMemo(() => {
    const technicians = new Set(mockMaintenanceRecords.map((r) => r.technician).filter(Boolean))
    return Array.from(technicians) as string[]
  }, [])

  // 篩選和搜尋邏輯
  const filteredRecords = useMemo(() => {
    let filtered = recordsWithDetails

    // 文字搜尋
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (record) =>
          record.vehicle.licensePlate.toLowerCase().includes(query) ||
          record.vehicle.brand.toLowerCase().includes(query) ||
          record.vehicle.model.toLowerCase().includes(query) ||
          record.vehicle.ownerName.toLowerCase().includes(query) ||
          record.item.name.toLowerCase().includes(query) ||
          record.technician?.toLowerCase().includes(query) ||
          record.notes?.toLowerCase().includes(query),
      )
    }

    // 分類篩選
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((record) => selectedCategories.includes(record.item.category))
    }

    // 保養項目篩選
    if (selectedItems.length > 0) {
      filtered = filtered.filter((record) => selectedItems.includes(record.itemId))
    }

    // 技師篩選
    if (selectedTechnicians.length > 0) {
      filtered = filtered.filter((record) => record.technician && selectedTechnicians.includes(record.technician))
    }

    // 車輛篩選
    if (selectedVehicles.length > 0) {
      filtered = filtered.filter((record) => selectedVehicles.includes(record.vehicleId))
    }

    // 日期範圍篩選
    if (dateRange.start) {
      filtered = filtered.filter((record) => new Date(record.date) >= new Date(dateRange.start))
    }
    if (dateRange.end) {
      filtered = filtered.filter((record) => new Date(record.date) <= new Date(dateRange.end))
    }

    // 金額範圍篩選
    if (costRange.min) {
      filtered = filtered.filter((record) => (record.cost || 0) >= Number.parseFloat(costRange.min))
    }
    if (costRange.max) {
      filtered = filtered.filter((record) => (record.cost || 0) <= Number.parseFloat(costRange.max))
    }

    // 公里數範圍篩選
    if (mileageRange.min) {
      filtered = filtered.filter((record) => record.mileage >= Number.parseInt(mileageRange.min))
    }
    if (mileageRange.max) {
      filtered = filtered.filter((record) => record.mileage <= Number.parseInt(mileageRange.max))
    }

    // 排序
    filtered.sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortField) {
        case "date":
          aValue = new Date(a.date).getTime()
          bValue = new Date(b.date).getTime()
          break
        case "mileage":
          aValue = a.mileage
          bValue = b.mileage
          break
        case "cost":
          aValue = a.cost || 0
          bValue = b.cost || 0
          break
        case "vehicle":
          aValue = `${a.vehicle.brand} ${a.vehicle.model}`
          bValue = `${b.vehicle.brand} ${b.vehicle.model}`
          break
        default:
          return 0
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [
    recordsWithDetails,
    searchQuery,
    selectedCategories,
    selectedItems,
    selectedTechnicians,
    selectedVehicles,
    dateRange,
    costRange,
    mileageRange,
    sortField,
    sortOrder,
  ])

  // 統計資料
  const statistics = useMemo(() => {
    const totalRecords = filteredRecords.length
    const totalCost = filteredRecords.reduce((sum, record) => sum + (record.cost || 0), 0)
    const avgCost = totalRecords > 0 ? totalCost / totalRecords : 0
    const uniqueVehicles = new Set(filteredRecords.map((r) => r.vehicleId)).size

    return { totalRecords, totalCost, avgCost, uniqueVehicles }
  }, [filteredRecords])

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

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }

  const handleItemToggle = (itemId: string) => {
    setSelectedItems((prev) => (prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]))
  }

  const handleTechnicianToggle = (technician: string) => {
    setSelectedTechnicians((prev) =>
      prev.includes(technician) ? prev.filter((t) => t !== technician) : [...prev, technician],
    )
  }

  const handleVehicleToggle = (vehicleId: string) => {
    setSelectedVehicles((prev) =>
      prev.includes(vehicleId) ? prev.filter((id) => id !== vehicleId) : [...prev, vehicleId],
    )
  }

  const clearAllFilters = () => {
    setSearchQuery("")
    setSelectedCategories([])
    setSelectedItems([])
    setSelectedTechnicians([])
    setSelectedVehicles([])
    setDateRange({ start: "", end: "" })
    setCostRange({ min: "", max: "" })
    setMileageRange({ min: "", max: "" })
  }

  const exportData = () => {
    // 模擬匯出功能
    const csvData = filteredRecords.map((record) => ({
      日期: new Date(record.date).toLocaleDateString("zh-TW"),
      車輛: `${record.vehicle.brand} ${record.vehicle.model}`,
      車牌: record.vehicle.licensePlate,
      車主: record.vehicle.ownerName,
      保養項目: record.item.name,
      分類: record.item.category,
      公里數: record.mileage,
      技師: record.technician || "",
      金額: record.cost || 0,
      備註: record.notes || "",
    }))

    console.log("匯出資料:", csvData)
    alert(`已匯出 ${csvData.length} 筆保養記錄`)
  }

  return (
    <MainLayout>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold">保養記錄管理</h1>
              <p className="text-gray-600">搜尋、篩選和分析所有保養記錄</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={exportData}>
                <Download className="h-4 w-4 mr-2" />
                匯出資料
              </Button>
              <Button variant="outline" onClick={clearAllFilters}>
                <RefreshCw className="h-4 w-4 mr-2" />
                清除篩選
              </Button>
            </div>
          </div>

          {/* 統計卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">總記錄數</p>
                    <p className="text-2xl font-bold">{statistics.totalRecords}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">總花費</p>
                    <p className="text-2xl font-bold">${statistics.totalCost.toLocaleString()}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">平均費用</p>
                    <p className="text-2xl font-bold">${Math.round(statistics.avgCost).toLocaleString()}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">涉及車輛</p>
                    <p className="text-2xl font-bold">{statistics.uniqueVehicles}</p>
                  </div>
                  <Car className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 搜尋和篩選區域 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              搜尋與篩選
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 主要搜尋 */}
            <div className="flex gap-4">
              <Input
                placeholder="搜尋車牌、車主、保養項目、技師或備註..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button
                variant="outline"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="whitespace-nowrap"
              >
                <Filter className="h-4 w-4 mr-2" />
                進階篩選
              </Button>
            </div>

            {/* 快速篩選 */}
            <div className="flex flex-wrap gap-2">
              <Label className="text-sm font-medium">快速篩選:</Label>
              {Object.values(
                defaultMaintenanceItems.reduce(
                  (acc, item) => ({ ...acc, [item.category]: item.category }),
                  {} as Record<string, string>,
                ),
              ).map((category) => (
                <Button
                  key={category}
                  variant={selectedCategories.includes(category) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleCategoryToggle(category)}
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* 進階篩選 */}
            {showAdvancedFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                {/* 日期範圍 */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">日期範圍</Label>
                  <div className="space-y-2">
                    <Input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                      placeholder="開始日期"
                    />
                    <Input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                      placeholder="結束日期"
                    />
                  </div>
                </div>

                {/* 金額範圍 */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">金額範圍</Label>
                  <div className="space-y-2">
                    <Input
                      type="number"
                      value={costRange.min}
                      onChange={(e) => setCostRange({ ...costRange, min: e.target.value })}
                      placeholder="最低金額"
                    />
                    <Input
                      type="number"
                      value={costRange.max}
                      onChange={(e) => setCostRange({ ...costRange, max: e.target.value })}
                      placeholder="最高金額"
                    />
                  </div>
                </div>

                {/* 公里數範圍 */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">公里數範圍</Label>
                  <div className="space-y-2">
                    <Input
                      type="number"
                      value={mileageRange.min}
                      onChange={(e) => setMileageRange({ ...mileageRange, min: e.target.value })}
                      placeholder="最低公里數"
                    />
                    <Input
                      type="number"
                      value={mileageRange.max}
                      onChange={(e) => setMileageRange({ ...mileageRange, max: e.target.value })}
                      placeholder="最高公里數"
                    />
                  </div>
                </div>

                {/* 保養項目 */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">保養項目</Label>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {defaultMaintenanceItems.map((item) => (
                      <div key={item.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`item-${item.id}`}
                          checked={selectedItems.includes(item.id)}
                          onCheckedChange={() => handleItemToggle(item.id)}
                        />
                        <Label htmlFor={`item-${item.id}`} className="text-sm">
                          {item.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 技師 */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">保養技師</Label>
                  <div className="space-y-1">
                    {allTechnicians.map((technician) => (
                      <div key={technician} className="flex items-center space-x-2">
                        <Checkbox
                          id={`tech-${technician}`}
                          checked={selectedTechnicians.includes(technician)}
                          onCheckedChange={() => handleTechnicianToggle(technician)}
                        />
                        <Label htmlFor={`tech-${technician}`} className="text-sm">
                          {technician}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 車輛 */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">車輛</Label>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {mockVehicles.map((vehicle) => (
                      <div key={vehicle.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`vehicle-${vehicle.id}`}
                          checked={selectedVehicles.includes(vehicle.id)}
                          onCheckedChange={() => handleVehicleToggle(vehicle.id)}
                        />
                        <Label htmlFor={`vehicle-${vehicle.id}`} className="text-sm">
                          {vehicle.licensePlate} - {vehicle.brand} {vehicle.model}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 排序和視圖控制 */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label className="text-sm">排序:</Label>
              <Select value={sortField} onValueChange={(value) => setSortField(value as SortField)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">日期</SelectItem>
                  <SelectItem value="mileage">公里數</SelectItem>
                  <SelectItem value="cost">金額</SelectItem>
                  <SelectItem value="vehicle">車輛</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
                {sortOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant={viewMode === "grid" ? "default" : "outline"} size="sm" onClick={() => setViewMode("grid")}>
              <Grid className="h-4 w-4" />
            </Button>
            <Button variant={viewMode === "list" ? "default" : "outline"} size="sm" onClick={() => setViewMode("list")}>
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* 記錄列表 */}
        {filteredRecords.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">沒有找到符合條件的保養記錄</p>
            </CardContent>
          </Card>
        ) : (
          <div className={viewMode === "grid" ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3" : "space-y-4"}>
            {filteredRecords.map((record) => (
              <Card key={record.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{record.item.name}</h3>
                        <Badge className={getCategoryColor(record.item.category)}>{record.item.category}</Badge>
                      </div>
                      {record.cost && <span className="font-bold text-green-600">${record.cost.toLocaleString()}</span>}
                    </div>

                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4" />
                        <span>
                          {record.vehicle.brand} {record.vehicle.model} ({record.vehicle.licensePlate})
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span>{record.vehicle.ownerName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(record.date).toLocaleDateString("zh-TW")}</span>
                      </div>
                      <div>公里數: {record.mileage.toLocaleString()} km</div>
                      {record.technician && <div>技師: {record.technician}</div>}
                    </div>

                    {record.notes && (
                      <div className="text-sm bg-gray-50 p-2 rounded">
                        <strong>備註:</strong> {record.notes}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  )
}
