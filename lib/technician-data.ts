import type { Technician } from "@/types"

export const mockTechnicians: Technician[] = [
  {
    id: "1",
    name: "陳志明",
    phone: "0912-345-678",
    email: "chen@example.com",
    position: "資深技師",
    specialties: ["引擎", "傳動"],
    hireDate: new Date("2018-03-15"),
    status: "active",
    notes: "專精進口車引擎維修，曾獲技師認證獎項",
    createdAt: new Date("2018-03-15"),
    updatedAt: new Date("2023-05-20"),
  },
  {
    id: "2",
    name: "林建國",
    phone: "0923-456-789",
    email: "lin@example.com",
    position: "中級技師",
    specialties: ["電氣", "冷卻"],
    hireDate: new Date("2020-06-10"),
    status: "active",
    notes: "電子系統專家，擅長診斷複雜電路問題",
    createdAt: new Date("2020-06-10"),
    updatedAt: new Date("2023-01-15"),
  },
  {
    id: "3",
    name: "王大明",
    phone: "0934-567-890",
    email: "wang@example.com",
    position: "初級技師",
    specialties: ["濾清", "煞車"],
    hireDate: new Date("2022-01-05"),
    status: "active",
    createdAt: new Date("2022-01-05"),
    updatedAt: new Date("2022-01-05"),
  },
  {
    id: "4",
    name: "李小華",
    phone: "0945-678-901",
    position: "資深技師",
    specialties: ["懸吊", "煞車", "引擎"],
    hireDate: new Date("2015-11-20"),
    status: "inactive",
    notes: "已離職，曾負責進口車特殊保養",
    createdAt: new Date("2015-11-20"),
    updatedAt: new Date("2023-08-01"),
  },
]
