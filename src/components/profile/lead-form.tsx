"use client"

import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { leadFormSchema, type LeadFormInput } from "@/lib/validations/lead"
import { submitLeadAction } from "@/actions/leads"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Send,
  Loader2,
  CheckCircle2,
  User,
  Phone,
  Mail,
  MessageSquare,
  Sparkles,
} from "lucide-react"
import { toast } from "sonner"
import { playHapticFeedback } from "@/lib/sound"

interface LeadFormProps {
  profileId: string
  fullName: string
  isDarkTheme?: boolean
  primaryColor?: string
  buttonShape?: string
}

export function LeadForm({
  profileId,
  fullName,
  isDarkTheme = true,
  primaryColor = "#3b82f6",
  buttonShape = "rounded-2xl",
}: LeadFormProps) {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<LeadFormInput>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      note: "",
      honeypot: "",
    },
  })

  const onSubmit = async (values: LeadFormInput) => {
    try {
      setIsSubmitting(true)
      const res = await submitLeadAction(profileId, values)
      if (res.success) {
        playHapticFeedback("notification")
        setIsSubmitted(true)
        toast.success("Đã gửi thông tin liên hệ thành công!")
        form.reset()
      } else {
        playHapticFeedback("tap")
        toast.error(res.error || "Không thể gửi thông tin")
      }
    } catch {
      toast.error("Đã xảy ra lỗi khi gửi. Vui lòng thử lại sau.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div
        className={`p-6 ${buttonShape} backdrop-blur-xl border text-center space-y-3 transition-all animate-scale-up ${
          isDarkTheme
            ? "bg-zinc-900/70 border-emerald-500/30 text-white"
            : "bg-white/80 border-emerald-500/30 text-zinc-900 shadow-md"
        }`}
      >
        <div className="w-12 h-12 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <h3 className="font-bold text-base">Thông tin của bạn đã được gửi!</h3>
        <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
          Cảm ơn bạn đã kết nối. {fullName} sẽ sớm nhận được thông báo và liên hệ lại với bạn.
        </p>
        <div className="pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              playHapticFeedback("tap")
              setIsSubmitted(false)
            }}
            className="text-xs rounded-full font-medium"
          >
            Gửi thêm tin nhắn khác
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`p-5 ${buttonShape} backdrop-blur-xl border transition-all ${
        isDarkTheme
          ? "bg-zinc-900/60 border-white/10 text-white"
          : "bg-white/80 border-zinc-200/80 text-zinc-900 shadow-md"
      }`}
    >
      <div className="flex items-center gap-2 pb-3 mb-3 border-b border-white/10">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
        >
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <h3 className="font-bold text-sm">Để lại thông tin kết nối</h3>
          <p className="text-[11px] text-muted-foreground">
            Gửi danh thiếp nhanh cho {fullName}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          {/* Honeypot field (ẩn) */}
          <input
            type="text"
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
            {...form.register("honeypot")}
          />

          {/* Họ tên */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-xs font-semibold">
                  Họ và tên <span className="text-rose-500">*</span>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      placeholder="VD: Nguyễn Văn A"
                      className={`h-9 pl-8.5 text-xs rounded-xl ${
                        isDarkTheme
                          ? "bg-zinc-800/80 border-white/10 text-white placeholder:text-zinc-500"
                          : "bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400"
                      }`}
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-[11px]" />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Số điện thoại */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-xs font-semibold">Số điện thoại / Zalo</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        placeholder="0987..."
                        className={`h-9 pl-8.5 text-xs rounded-xl ${
                          isDarkTheme
                            ? "bg-zinc-800/80 border-white/10 text-white placeholder:text-zinc-500"
                            : "bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400"
                        }`}
                        {...field}
                        value={field.value || ""}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-xs font-semibold">Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        placeholder="ten@email.com"
                        type="email"
                        className={`h-9 pl-8.5 text-xs rounded-xl ${
                          isDarkTheme
                            ? "bg-zinc-800/80 border-white/10 text-white placeholder:text-zinc-500"
                            : "bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400"
                        }`}
                        {...field}
                        value={field.value || ""}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />
          </div>

          {/* Lời nhắn */}
          <FormField
            control={form.control}
            name="note"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-xs font-semibold">Lời nhắn (tùy chọn)</FormLabel>
                <FormControl>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <Textarea
                      placeholder="Lời chào, nhu cầu hợp tác hoặc thông tin giới thiệu ngắn..."
                      rows={2}
                      className={`pl-8.5 text-xs rounded-xl min-h-[58px] ${
                        isDarkTheme
                          ? "bg-zinc-800/80 border-white/10 text-white placeholder:text-zinc-500"
                          : "bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400"
                      }`}
                      {...field}
                      value={field.value || ""}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-[11px]" />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={isSubmitting}
            style={{ backgroundColor: primaryColor }}
            className={`w-full h-10 text-xs font-bold text-white shadow-md active:scale-98 transition-all rounded-xl mt-1`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                <span>Đang gửi thông tin...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5 mr-1.5" />
                <span>Gửi thông tin liên hệ</span>
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  )
}
