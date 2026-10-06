import { Metadata } from "next"
import { requireUser } from "@/lib/auth"
import { getLeadsAction } from "@/actions/leads"
import { LeadsManager } from "@/components/dashboard/leads-manager"

export const metadata: Metadata = {
  title: "Danh bạ thu thập (Leads) - Trang Cá Nhân NFC",
  description: "Quản lý thông tin khách hàng và đối tác đã kết nối qua thẻ NFC của bạn",
}

export default async function DashboardLeadsPage() {
  await requireUser()

  const res = await getLeadsAction()
  const leads = res.leads || []

  return <LeadsManager initialLeads={leads} />
}
