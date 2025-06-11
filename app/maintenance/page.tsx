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
import { Textarea } from "@/components/ui/textarea"
import { Plus, Edit, Trash2, Wrench, Filter } from "lucide-react"
import { defaultMaintenanceItems, MaintenanceCategory } from "@/lib/data"
import type { MaintenanceItem } from "@/types"

export default function MaintenancePage() {
  const [items, setItems] = useState<MaintenanceItem[]>(defaultMaintenanceItems)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MaintenanceItem | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingItem) {
      // 更新保養項目
      setItems(
        items.map((item) =>
          item.id === editingItem.id
            ? {
                ...item,
                name: formData.name,
                category: formData.category as MaintenanceCategory,
                description: formData.description,
              }
            : item,
        ),
      )
    } else {
      // 新增保養項目
      const newItem: MaintenanceItem = {
        id: Date.now().toString(),
        name: formData.name,
        category: formData.category as MaintenanceCategory,
        description: formData.description,
      }
      setItems([...items, newItem])
    }

    setIsDialogOpen(false)
    setEditingItem(null)
    setFormData({ name: "", category: "", description: "" })
  }

  const handleEdit = (item: MaintenanceItem) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      category: item.category,
      description: item.description || "",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (itemId: string) => {
    if (confirm("確定要刪除這個保養項目嗎？")) {
      setItems(items.filter((item) => item.id !== itemId))
    }
  }

  const filteredItems = selectedCategory === "all" ? items : items.filter((item) => item.category === selectedCategory)

  const getCategoryColor = (category: MaintenanceCategory) => {
    const colors: Record<MaintenanceCategory, string> = {
      [MaintenanceCategory.ENGINE]: "bg-red-100 text-red-800 border-red-200",
      [MaintenanceCategory.TRANSMISSION]: "bg-blue-100 text-blue-800 border-blue-200",
      [MaintenanceCategory.COOLING]: "bg-cyan-100 text-cyan-800 border-cyan-200",
      [MaintenanceCategory.ELECTRICAL]: "bg-yellow-100 text-yellow-800 border-yellow-200",
      [MaintenanceCategory.SUSPENSION]: "bg-purple-100 text-purple-800 border-purple-200",
      [MaintenanceCategory.BRAKE]: "bg-orange-100 text-orange-800 border-orange-200",
      [MaintenanceCategory.FILTER]: "bg-green-100 text-green-800 border-green-200",
    }
    return colors[category] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  const getCategoryIcon = (category: MaintenanceCategory) => {
    return <Wrench className="h-4 w-4" />
  }

  const groupedItems = Object.values(MaintenanceCategory).map((category) => ({
    category,
    items: items.filter((item) => item.category === category),
  }))

  return (
    <MainLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">保養項目管理</h1>
            <p className="text-gray-600">管理所有保養項目和分類</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                新增保養項目
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingItem ? "編輯保養項目" : "新增保養項目"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">項目名稱</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="例如：引擎機油"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category">分類</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="選擇分類" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(MaintenanceCategory).map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="description">說明 (選填)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="保養項目的詳細說明..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    取消
                  </Button>
                  <Button type="submit">{editingItem ? "更新" : "新增"}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* 分類篩選 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              分類篩選
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("all")}
              >
                全部 ({items.length})
              </Button>
              {Object.values(MaintenanceCategory).map((category) => {
                const count = items.filter((item) => item.category === category).length
                return (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category} ({count})
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* 統計卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">總項目數</p>
                  <p className="text-2xl font-bold">{items.length}</p>
                </div>
                <Wrench className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          {Object.values(MaintenanceCategory)
            .slice(0, 3)
            .map((category) => {
              const count = items.filter((item) => item.category === category).length
              return (
                <Card key={category}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{category}</p>
                        <p className="text-2xl font-bold">{count}</p>
                      </div>
                      {getCategoryIcon(category)}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
        </div>

        {/* 按分類顯示保養項目 */}
        <div className="space-y-6">
          {groupedItems.map(({ category, items: categoryItems }) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getCategoryIcon(category)}
                  {category}
                  <Badge variant="secondary">{categoryItems.length} 項目</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {categoryItems.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">此分類暫無保養項目</p>
                ) : (
                  <div className="grid gap-3">
                    {categoryItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{item.name}</h3>
                            <Badge className={getCategoryColor(item.category)}>{item.category}</Badge>
                          </div>
                          {item.description && <p className="text-sm text-gray-600">{item.description}</p>}
                        </div>

                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDelete(item.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  )
}
