"use client"

import type React from "react"

import { useState } from "react"
import { MainLayout } from "@/components/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Users, User, Phone, Mail, Calendar, Tag, Edit, Trash2, AlertCircle, Award } from "lucide-react"
import { mockTechnicians } from "@/lib/technician-data"
import { MaintenanceCategory } from "@/lib/data"
import type { Technician } from "@/types"

export default function TechniciansPage() {
  const [technicians, setTechnicians] = useState<Technician[]>(mockTechnicians)
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingTechnician, setEditingTechnician] = useState<Technician | null>(null)
  const [deletingTechnician, setDeletingTechnician] = useState<Technician | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    position: "",
    specialties: [] as string[],
    hireDate: "",
    status: "active" as "active" | "inactive",
    notes: "",
  })

  const filteredTechnicians = technicians.filter(
    (technician) =>
      technician.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      technician.phone.includes(searchQuery) ||
      technician.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (technician.email && technician.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      technician.specialties.some((specialty) => specialty.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const technicianData = {
      ...formData,
      hireDate: new Date(formData.hireDate),
    }

    if (editingTechnician) {
      // 更新技師
      setTechnicians(
        technicians.map((tech) =>
          tech.id === editingTechnician.id
            ? {
                ...tech,
                ...technicianData,
                updatedAt: new Date(),
              }
            : tech,
        ),
      )
    } else {
      // 新增技師
      const newTechnician: Technician = {
        id: Date.now().toString(),
        ...technicianData,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      setTechnicians([...technicians, newTechnician])
    }

    setIsDialogOpen(false)
    resetForm()
  }

  const handleEdit = (technician: Technician) => {
    setEditingTechnician(technician)
    setFormData({
      name: technician.name,
      phone: technician.phone,
      email: technician.email || "",
      position: technician.position,
      specialties: technician.specialties,
      hireDate: new Date(technician.hireDate).toISOString().split("T")[0],
      status: technician.status,
      notes: technician.notes || "",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (technician: Technician) => {
    setDeletingTechnician(technician)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (deletingTechnician) {
      setTechnicians(technicians.filter((tech) => tech.id !== deletingTechnician.id))
      setIsDeleteDialogOpen(false)
      setDeletingTechnician(null)
    }
  }

  const resetForm = () => {
    setEditingTechnician(null)
    setFormData({
      name: "",
      phone: "",
      email: "",
      position: "",
      specialties: [],
      hireDate: "",
      status: "active",
      notes: "",
    })
  }

  const handleSpecialtyToggle = (specialty: string) => {
    setFormData((prev) => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter((s) => s !== specialty)
        : [...prev.specialties, specialty],
    }))
  }

  const getStatusBadge = (status: "active" | "inactive") => {
    return status === "active" ? (
      <Badge className="bg-green-100 text-green-800">在職</Badge>
    ) : (
      <Badge variant="secondary" className="bg-gray-100 text-gray-800">
        離職
      </Badge>
    )
  }

  const getSpecialtyBadge = (specialty: string) => {
    const colors: Record<string, string> = {
      引擎: "bg-red-100 text-red-800",
      傳動: "bg-blue-100 text-blue-800",
      冷卻: "bg-cyan-100 text-cyan-800",
      電氣: "bg-yellow-100 text-yellow-800",
      懸吊: "bg-purple-100 text-purple-800",
      煞車: "bg-orange-100 text-orange-800",
      濾清: "bg-green-100 text-green-800",
    }
    return colors[specialty] || "bg-gray-100 text-gray-800"
  }

  const getPositionIcon = (position: string) => {
    if (position.includes("資深")) return <Award className="h-4 w-4 text-yellow-600" />
    if (position.includes("中級")) return <User className="h-4 w-4 text-blue-600" />
    return <User className="h-4 w-4 text-gray-600" />
  }

  const getWorkYears = (hireDate: Date) => {
    const years = new Date().getFullYear() - new Date(hireDate).getFullYear()
    return years
  }

  return (
    <MainLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">技師維護</h1>
            <p className="text-gray-600">管理所有技師資料和專長</p>
          </div>

          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open)
              if (!open) resetForm()
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                新增技師
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingTechnician ? "編輯技師資料" : "新增技師"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">姓名</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone">電話</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">電子郵件 (選填)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="position">職位</Label>
                  <Select
                    value={formData.position}
                    onValueChange={(value) => setFormData({ ...formData, position: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="選擇職位" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="資深技師">資深技師</SelectItem>
                      <SelectItem value="中級技師">中級技師</SelectItem>
                      <SelectItem value="初級技師">初級技師</SelectItem>
                      <SelectItem value="學徒">學徒</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="hireDate">到職日期</Label>
                  <Input
                    id="hireDate"
                    type="date"
                    value={formData.hireDate}
                    onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="status">狀態</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: "active" | "inactive") => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">在職</SelectItem>
                      <SelectItem value="inactive">離職</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="block mb-2">專長</Label>
                  <div className="flex flex-wrap gap-2">
                    {Object.values(MaintenanceCategory).map((category) => (
                      <Badge
                        key={category}
                        variant={formData.specialties.includes(category) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => handleSpecialtyToggle(category)}
                      >
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">備註 (選填)</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="輸入備註..."
                    rows={3}
                  />
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false)
                      resetForm()
                    }}
                  >
                    取消
                  </Button>
                  <Button type="submit">{editingTechnician ? "更新" : "新增"}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* 搜尋區域 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              搜尋技師
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="搜尋姓名、電話、職位、專長..."
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
                  <p className="text-sm font-medium text-gray-600">總技師數</p>
                  <p className="text-2xl font-bold">{technicians.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">在職技師</p>
                  <p className="text-2xl font-bold">{technicians.filter((t) => t.status === "active").length}</p>
                </div>
                <User className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">資深技師</p>
                  <p className="text-2xl font-bold">
                    {technicians.filter((t) => t.position.includes("資深") && t.status === "active").length}
                  </p>
                </div>
                <Award className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">平均年資</p>
                  <p className="text-2xl font-bold">
                    {Math.round(
                      technicians
                        .filter((t) => t.status === "active")
                        .reduce((sum, t) => sum + getWorkYears(t.hireDate), 0) /
                        technicians.filter((t) => t.status === "active").length || 0,
                    )}{" "}
                    年
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 技師卡片格狀顯示 */}
        {filteredTechnicians.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">沒有找到符合條件的技師</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTechnicians.map((technician) => (
              <Card
                key={technician.id}
                className={`hover:shadow-lg transition-all duration-200 ${
                  technician.status === "inactive" ? "bg-gray-50 opacity-75" : "hover:scale-105"
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getPositionIcon(technician.position)}
                      <CardTitle className="text-lg">{technician.name}</CardTitle>
                    </div>
                    {getStatusBadge(technician.status)}
                  </div>
                  <p className="text-sm text-gray-600">{technician.position}</p>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* 聯絡資訊 */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span>{technician.phone}</span>
                    </div>
                    {technician.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span className="truncate">{technician.email}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>
                        到職: {new Date(technician.hireDate).toLocaleDateString("zh-TW")} (
                        {getWorkYears(technician.hireDate)}年)
                      </span>
                    </div>
                  </div>

                  {/* 專長標籤 */}
                  <div>
                    <div className="flex items-center gap-1 mb-2">
                      <Tag className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">專長領域</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {technician.specialties.map((specialty) => (
                        <Badge key={specialty} className={getSpecialtyBadge(specialty)} variant="secondary">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* 備註 */}
                  {technician.notes && (
                    <div className="text-sm bg-gray-50 p-2 rounded border-l-4 border-blue-200">
                      <p className="text-gray-700">{technician.notes}</p>
                    </div>
                  )}

                  {/* 操作按鈕 */}
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(technician)}>
                      <Edit className="h-4 w-4 mr-1" />
                      編輯
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(technician)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* 刪除確認對話框 */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>確認刪除</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <div className="flex items-center gap-2 mb-4 text-amber-600">
                <AlertCircle className="h-5 w-5" />
                <p className="font-medium">您確定要刪除此技師資料嗎？</p>
              </div>
              {deletingTechnician && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p>
                    <strong>姓名:</strong> {deletingTechnician.name}
                  </p>
                  <p>
                    <strong>職位:</strong> {deletingTechnician.position}
                  </p>
                  <p>
                    <strong>電話:</strong> {deletingTechnician.phone}
                  </p>
                </div>
              )}
              <p className="mt-4 text-sm text-gray-600">此操作無法復原，刪除後資料將永久消失。</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                取消
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                確認刪除
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}
