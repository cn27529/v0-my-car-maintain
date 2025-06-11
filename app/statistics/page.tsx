"use client"

import { useState, useMemo } from "react"
import { MainLayout } from "@/components/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, LineChart, PieChart } from "@/components/ui/chart"
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Wrench,
  DollarSign,
  Users,
  Car,
  Award,
  Download,
  RefreshCw,
} from "lucide-react"
import { mockMaintenanceRecords, defaultMaintenanceItems } from "@/lib/data"

type TimeFilter = "1month" | "3months" | "6months" | "1year" | "all"

interface MaintenanceStats {
  itemId: string
  itemName: string
  category: string
  count: number
  totalCost: number
  avgCost: number
  lastMaintenance: Date
}

interface TechnicianStats {
  name: string
  count: number
  totalCost: number
}

interface MonthlyStats {
  month: string
  count: number
  cost: number
}

export default function StatisticsPage() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  // 根據時間篩選器過濾記錄
  const filteredRecords = useMemo(() => {
    const now = new Date()
    let startDate: Date

    switch (timeFilter) {
      case "1month":
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
        break
      case "3months":
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
        break
      case "6months":
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate())
        break
      case "1year":
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
        break
      default:
        return mockMaintenanceRecords
    }

    return mockMaintenanceRecords.filter((record) => new Date(record.date) >= startDate)
  }, [timeFilter])

  // 計算保養項目統計
  const maintenanceStats = useMemo(() => {
    const statsMap = new Map<string, MaintenanceStats>()

    filteredRecords.forEach((record) => {
      const item = defaultMaintenanceItems.find((item) => item.id === record.itemId)
      if (!item) return

      if (selectedCategory !== "all" && item.category !== selectedCategory) return

      const existing = statsMap.get(record.itemId)
      if (existing) {
        existing.count += 1
        existing.totalCost += record.cost || 0
        existing.avgCost = existing.totalCost / existing.count
        if (new Date(record.date) > existing.lastMaintenance) {
          existing.lastMaintenance = new Date(record.date)
        }
      } else {
        statsMap.set(record.itemId, {
          itemId: record.itemId,
          itemName: item.name,
          category: item.category,
          count: 1,
          totalCost: record.cost || 0,
          avgCost: record.cost || 0,
          lastMaintenance: new Date(record.date),
        })
      }
    })

    return Array.from(statsMap.values()).sort((a, b) => b.count - a.count)
  }, [filteredRecords, selectedCategory])

  // 計算技師統計
  const technicianStats = useMemo(() => {
    const statsMap = new Map<string, TechnicianStats>()

    filteredRecords.forEach((record) => {
      if (!record.technician) return

      const existing = statsMap.get(record.technician)
      if (existing) {
        existing.count += 1
        existing.totalCost += record.cost || 0
      } else {
        statsMap.set(record.technician, {
          name: record.technician,
          count: 1,
          totalCost: record.cost || 0,
        })
      }
    })

    return Array.from(statsMap.values()).sort((a, b) => b.count - a.count)
  }, [filteredRecords])

  // 計算月度統計
  const monthlyStats = useMemo(() => {
    const statsMap = new Map<string, MonthlyStats>()

    filteredRecords.forEach((record) => {
      const date = new Date(record.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`

      const existing = statsMap.get(monthKey)
      if (existing) {
        existing.count += 1
        existing.cost += record.cost || 0
      } else {
        statsMap.set(monthKey, {
          month: monthKey,
          count: 1,
          cost: record.cost || 0,
        })
      }
    })

    return Array.from(statsMap.values())
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12) // 只顯示最近12個月
  }, [filteredRecords])

  // 計算分類統計
  const categoryStats = useMemo(() => {
    const statsMap = new Map<string, number>()

    filteredRecords.forEach((record) => {
      const item = defaultMaintenanceItems.find((item) => item.id === record.itemId)
      if (!item) return

      const existing = statsMap.get(item.category)
      statsMap.set(item.category, (existing || 0) + 1)
    })

    return Array.from(statsMap.entries()).map(([category, count]) => ({
      name: category,
      value: count,
    }))
  }, [filteredRecords])

  // 總體統計
  const overallStats = useMemo(() => {
    const totalRecords = filteredRecords.length
    const totalCost = filteredRecords.reduce((sum, record) => sum + (record.cost || 0), 0)
    const avgCost = totalRecords > 0 ? totalCost / totalRecords : 0
    const uniqueVehicles = new Set(filteredRecords.map((record) => record.vehicleId)).size
    const uniqueTechnicians = new Set(filteredRecords.map((record) => record.technician).filter(Boolean)).size

    return {
      totalRecords,
      totalCost,
      avgCost,
      uniqueVehicles,
      uniqueTechnicians,
    }
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

  const getTimeFilterLabel = (filter: TimeFilter) => {
    const labels = {
      "1month": "近一個月",
      "3months": "近三個月",
      "6months": "近半年",
      "1year": "近一年",
      all: "全部時間",
    }
    return labels[filter]
  }

  const exportData = () => {
    const exportData = {
      timeFilter: getTimeFilterLabel(timeFilter),
      overallStats,
      maintenanceStats,
      technicianStats,
      monthlyStats,
      categoryStats,
      generatedAt: new Date().toISOString(),
    }

    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `maintenance-statistics-${timeFilter}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <MainLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">保養數據統計</h1>
            <p className="text-gray-600">分析保養業務趨勢和熱門項目</p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={exportData}>
              <Download className="h-4 w-4 mr-2" />
              匯出報表
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              重新整理
            </Button>
          </div>
        </div>

        {/* 篩選器 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              時間篩選
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-center">
              <div className="flex gap-2">
                {(["1month", "3months", "6months", "1year", "all"] as TimeFilter[]).map((filter) => (
                  <Button
                    key={filter}
                    variant={timeFilter === filter ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTimeFilter(filter)}
                  >
                    {getTimeFilterLabel(filter)}
                  </Button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">分類篩選:</span>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部</SelectItem>
                    {Object.values(
                      defaultMaintenanceItems.reduce(
                        (acc, item) => ({ ...acc, [item.category]: item.category }),
                        {} as Record<string, string>,
                      ),
                    ).map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 總體統計卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">總保養次數</p>
                  <p className="text-2xl font-bold">{overallStats.totalRecords}</p>
                </div>
                <Wrench className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">總收入</p>
                  <p className="text-2xl font-bold">${overallStats.totalCost.toLocaleString()}</p>
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
                  <p className="text-2xl font-bold">${Math.round(overallStats.avgCost).toLocaleString()}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">服務車輛</p>
                  <p className="text-2xl font-bold">{overallStats.uniqueVehicles}</p>
                </div>
                <Car className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">參與技師</p>
                  <p className="text-2xl font-bold">{overallStats.uniqueTechnicians}</p>
                </div>
                <Users className="h-8 w-8 text-indigo-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 圖表區域 */}
        <Tabs defaultValue="items" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="items">保養項目分析</TabsTrigger>
            <TabsTrigger value="trends">趨勢分析</TabsTrigger>
            <TabsTrigger value="categories">分類統計</TabsTrigger>
            <TabsTrigger value="technicians">技師績效</TabsTrigger>
          </TabsList>

          {/* 保養項目分析 */}
          <TabsContent value="items">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    保養項目數量統計
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <BarChart
                    data={maintenanceStats.slice(0, 10).map((stat) => ({
                      name: stat.itemName,
                      value: stat.count,
                    }))}
                    height={400}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    熱門保養項目排行
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {maintenanceStats.slice(0, 10).map((stat, index) => (
                      <div key={stat.itemId} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <h3 className="font-medium">{stat.itemName}</h3>
                            <Badge className={getCategoryColor(stat.category)} variant="secondary">
                              {stat.category}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">{stat.count} 次</p>
                          <p className="text-sm text-gray-600">總收入: ${stat.totalCost.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">平均: ${Math.round(stat.avgCost).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 趨勢分析 */}
          <TabsContent value="trends">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>月度保養次數趨勢</CardTitle>
                </CardHeader>
                <CardContent>
                  <LineChart
                    data={monthlyStats.map((stat) => ({
                      name: stat.month,
                      value: stat.count,
                    }))}
                    height={300}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>月度收入趨勢</CardTitle>
                </CardHeader>
                <CardContent>
                  <LineChart
                    data={monthlyStats.map((stat) => ({
                      name: stat.month,
                      value: Math.round(stat.cost),
                    }))}
                    height={300}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 分類統計 */}
          <TabsContent value="categories">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>保養分類分布</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center">
                    <PieChart data={categoryStats} size={300} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>分類詳細統計</CardTitle>
                </CardHeader>
                <CardContent>
                  <BarChart
                    data={categoryStats.map((stat) => ({
                      name: stat.name,
                      value: stat.value,
                    }))}
                    height={300}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 技師績效 */}
          <TabsContent value="technicians">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>技師工作量統計</CardTitle>
                </CardHeader>
                <CardContent>
                  <BarChart
                    data={technicianStats.map((stat) => ({
                      name: stat.name,
                      value: stat.count,
                    }))}
                    height={300}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>技師績效排行</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {technicianStats.map((stat, index) => (
                      <div key={stat.name} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-800 font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <h3 className="font-medium">{stat.name}</h3>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">{stat.count} 次</p>
                          <p className="text-sm text-gray-600">總收入: ${stat.totalCost.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">
                            平均: ${Math.round(stat.totalCost / stat.count).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
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
