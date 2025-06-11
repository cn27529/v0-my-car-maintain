export interface Vehicle {
  id: string
  brand: string // 廠牌
  model: string // 車款
  engineCode: string // 引擎代碼
  currentMileage: number // 目前公里數
  licensePlate: string // 車牌
  ownerName: string // 車主姓名
  customerPhone: string // 客戶電話
  manufactureYear: number // 出廠年份
  createdAt: Date
  updatedAt: Date
}

export interface MaintenanceItem {
  id: string
  name: string
  category: MaintenanceCategory
  description?: string
}

export enum MaintenanceCategory {
  ENGINE = "引擎",
  TRANSMISSION = "傳動",
  COOLING = "冷卻",
  ELECTRICAL = "電氣",
  SUSPENSION = "懸吊",
  BRAKE = "煞車",
  FILTER = "濾清",
}

export interface MaintenanceRecord {
  id: string
  vehicleId: string
  itemId: string
  date: Date
  mileage: number
  technician?: string // 保養人員
  notes?: string
  cost?: number
  nextMaintenanceMileage?: number
  createdAt: Date
  updatedAt: Date
}

export interface MaintenanceHistory {
  vehicle: Vehicle
  records: (MaintenanceRecord & { item: MaintenanceItem })[]
}

export interface Technician {
  id: string
  name: string
  phone: string
  email?: string
  position: string
  specialties: string[]
  hireDate: Date
  status: "active" | "inactive"
  notes?: string
  createdAt: Date
  updatedAt: Date
}
