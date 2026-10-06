"use client"

import React, { useState, useTransition } from "react"
import {
  Search,
  Download,
  Trash2,
  Phone,
  Mail,
  Calendar,
  MessageSquare,
  Loader2,
  AlertTriangle,
  UserCheck,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { deleteLeadAction, exportLeadsCsvAction, type LeadItem } from "@/actions/leads"
import { toast } from "sonner"

interface LeadsManagerProps {
  initialLeads: LeadItem[]
}

export function LeadsManager({ initialLeads }: LeadsManagerProps) {
  const [leads, setLeads] = useState<LeadItem[]>(initialLeads)
  const [searchQuery, setSearchQuery] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<LeadItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isExporting, startExportTransition] = useTransition()

  // Tìm kiếm theo tên, sđt, email, ghi chú
  const filteredLeads = leads.filter((item) => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return true
    return (
      item.name.toLowerCase().includes(q) ||
      (item.phone && item.phone.includes(q)) ||
      (item.email && item.email.toLowerCase().includes(q)) ||
      (item.note && item.note.toLowerCase().includes(q))
    )
  })

  // Xử lý xuất file CSV
  const handleExportCsv = () => {
    startExportTransition(async () => {
      try {
        const res = await exportLeadsCsvAction()
        if (res.success && res.csvData) {
          const blob = new Blob([res.csvData], { type: "text/csv;charset=utf-8;" })
          const url = URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url
          a.download = res.filename || "danh-ba-nfc.csv"
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
          toast.success("Đã tải xuống danh sách liên hệ thành công!")
        } else {
          toast.error(res.error || "Không thể xuất file CSV")
        }
      } catch {
        toast.error("Lỗi khi xuất file CSV")
      }
    })
  }

  // Xử lý xóa lead
  const confirmDelete = async () => {
    if (!deleteTarget) return
    try {
      setIsDeleting(true)
      const res = await deleteLeadAction(deleteTarget.id)
      if (res.success) {
        setLeads((prev) => prev.filter((l) => l.id !== deleteTarget.id))
        toast.success(`Đã xóa liên hệ của "${deleteTarget.name}"`)
        setDeleteTarget(null)
      } else {
        toast.error(res.error || "Không thể xóa liên hệ")
      }
    } catch {
      toast.error("Đã xảy ra lỗi khi xóa")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Danh bạ thu thập (Leads)</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Quản lý danh sách khách hàng, đối tác đã gửi thông tin liên hệ từ trang cá nhân NFC của bạn
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            disabled={isExporting || leads.length === 0}
            className="text-xs h-9 rounded-xl font-medium gap-1.5 shadow-xs"
          >
            {isExporting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            <span>Xuất file CSV</span>
          </Button>
        </div>
      </div>

      {/* Toolbar Tìm kiếm & Thống kê số lượng */}
      <Card className="border-border/60 shadow-xs">
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm theo tên, số điện thoại, email hoặc ghi chú..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs rounded-xl"
              />
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
              <span className="font-semibold text-foreground">{filteredLeads.length}</span>
              <span>/</span>
              <span>{leads.length} liên hệ</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danh sách Leads */}
      {leads.length === 0 ? (
        <Card className="border-border/60 shadow-xs border-dashed">
          <CardContent className="py-16 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <UserCheck className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-base text-foreground">Chưa có liên hệ nào</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
              Khi khách quét thẻ NFC hoặc quét mã QR của bạn và gửi thông tin liên hệ, danh bạ sẽ xuất hiện tại đây.
            </p>
          </CardContent>
        </Card>
      ) : filteredLeads.length === 0 ? (
        <div className="py-12 text-center text-sm text-muted-foreground">
          Không tìm thấy liên hệ nào khớp với từ khóa &ldquo;{searchQuery}&rdquo;.
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredLeads.map((lead) => {
            const formattedDate = new Date(lead.created_at).toLocaleString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })

            return (
              <Card
                key={lead.id}
                className="border-border/60 shadow-xs hover:border-primary/40 transition-colors"
              >
                <CardContent className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-2.5 min-w-0">
                      {/* Name & Date */}
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <div className="h-8 w-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0 uppercase">
                          {lead.name.charAt(0)}
                        </div>
                        <h4 className="font-bold text-sm text-foreground truncate">
                          {lead.name}
                        </h4>
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-mono">
                          <Calendar className="h-3 w-3" />
                          {formattedDate}
                        </span>
                      </div>

                      {/* Contact Badges: Phone & Email */}
                      <div className="flex items-center gap-2 flex-wrap pt-0.5">
                        {lead.phone && (
                          <a
                            href={`tel:${lead.phone}`}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold transition-colors"
                          >
                            <Phone className="h-3 w-3" />
                            <span>{lead.phone}</span>
                          </a>
                        )}

                        {lead.email && (
                          <a
                            href={`mailto:${lead.email}`}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 text-xs font-semibold transition-colors truncate max-w-xs"
                          >
                            <Mail className="h-3 w-3 shrink-0" />
                            <span className="truncate">{lead.email}</span>
                          </a>
                        )}
                      </div>

                      {/* Note */}
                      {lead.note && (
                        <div className="p-3 rounded-xl bg-muted/40 border border-border/40 text-xs text-foreground/90 flex items-start gap-2 max-w-2xl">
                          <MessageSquare className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                          <p className="whitespace-pre-wrap leading-relaxed">{lead.note}</p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-start">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setDeleteTarget(lead)}
                        className="text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                        title="Xóa liên hệ"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Dialog xác nhận xóa */}
      <Dialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-600">
              <AlertTriangle className="h-5 w-5" />
              <span>Xác nhận xóa liên hệ?</span>
            </DialogTitle>
            <DialogDescription className="text-xs leading-relaxed">
              Bạn có chắc chắn muốn xóa thông tin liên hệ của{" "}
              <strong className="text-foreground">{deleteTarget?.name}</strong>? Thao tác này
              không thể khôi phục lại.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              disabled={isDeleting}
              onClick={() => setDeleteTarget(null)}
              className="rounded-xl text-xs"
            >
              Hủy
            </Button>
            <Button
              type="button"
              disabled={isDeleting}
              onClick={confirmDelete}
              className="rounded-xl text-xs bg-rose-600 hover:bg-rose-700 text-white"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  Đang xóa...
                </>
              ) : (
                "Xác nhận xóa"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
