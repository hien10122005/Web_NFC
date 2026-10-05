"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { onboardingSchema, type OnboardingInput } from "@/lib/validations/onboarding"
import { checkUsernameAction, completeOnboardingAction } from "@/actions/onboarding"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  AtSign,
  CheckCircle2,
  Globe,
  Loader2,
  Sparkles,
  User,
  XCircle,
} from "lucide-react"

interface OnboardingFormProps {
  initialFullName?: string
}

export function OnboardingForm({ initialFullName = "" }: OnboardingFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isChecking, setIsChecking] = React.useState(false)
  const [availability, setAvailability] = React.useState<{
    checked: boolean
    available: boolean
    message?: string
  }>({ checked: false, available: false })

  const form = useForm<OnboardingInput>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      fullName: initialFullName,
      username: "",
    },
    mode: "onChange",
  })

  const usernameValue = form.watch("username")

  // Debounced check username availability
  React.useEffect(() => {
    const clean = usernameValue?.trim().toLowerCase()
    if (!clean || clean.length < 3) {
      setAvailability({ checked: false, available: false })
      return
    }

    const timer = setTimeout(async () => {
      try {
        setIsChecking(true)
        const res = await checkUsernameAction(clean)
        setAvailability({
          checked: true,
          available: res.available,
          message: res.available ? "Username khả dụng" : (res.error || "Username đã có người sử dụng"),
        })
      } catch {
        setAvailability({ checked: false, available: false })
      } finally {
        setIsChecking(false)
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [usernameValue])

  async function onSubmit(values: OnboardingInput) {
    if (!availability.available) {
      toast.error("Vui lòng chọn một username khả dụng trước khi tiếp tục.")
      return
    }

    try {
      setIsSubmitting(true)
      const res = await completeOnboardingAction(values)

      if (res?.error) {
        toast.error(res.error)
        return
      }

      toast.success("Thiết lập hồ sơ thành công!")
      router.push("/dashboard")
      router.refresh()
    } catch {
      toast.error("Đã xảy ra lỗi khi hoàn tất thiết lập. Vui lòng thử lại.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const origin = typeof window !== "undefined" ? window.location.host : "trangcanhan.vn"

  return (
    <Card className="border-border/60 shadow-xl max-w-lg mx-auto">
      <CardHeader className="text-center space-y-2 pb-6">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Sparkles className="h-7 w-7" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">
          Chào mừng bạn đến với NFC Card!
        </CardTitle>
        <CardDescription className="text-sm">
          Chỉ một bước nữa để hoàn tất: hãy chọn họ tên hiển thị và định danh (username) duy nhất cho trang cá nhân của bạn.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Họ và tên hiển thị</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Nguyễn Văn A"
                        disabled={isSubmitting}
                        className="pl-9"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chọn Username cá nhân</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <AtSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="nguyenvana"
                        autoCapitalize="none"
                        autoCorrect="off"
                        disabled={isSubmitting}
                        className="pl-9 pr-10 lowercase font-mono text-sm"
                        {...field}
                        onChange={(e) => {
                          const val = e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, "")
                          field.onChange(val)
                        }}
                      />
                      <div className="absolute right-3 top-2.5">
                        {isChecking ? (
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        ) : availability.checked ? (
                          availability.available ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-destructive" />
                          )
                        ) : null}
                      </div>
                    </div>
                  </FormControl>

                  {/* Status Indicator text */}
                  {availability.checked && (
                    <p
                      className={`text-xs font-medium mt-1 ${
                        availability.available ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"
                      }`}
                    >
                      {availability.message}
                    </p>
                  )}

                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Live URL Preview */}
            <div className="rounded-xl border border-border/80 bg-muted/40 p-3.5 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <Globe className="h-3.5 w-3.5 text-primary" />
                <span>Đường dẫn trang cá nhân của bạn:</span>
              </div>
              <div className="font-mono text-sm font-semibold text-primary break-all">
                {origin}/u/{usernameValue ? usernameValue.trim().toLowerCase() : "username"}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-base font-semibold mt-2"
              disabled={isSubmitting || isChecking || !availability.available}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Hoàn tất & Vào Dashboard
            </Button>
          </form>
        </Form>
      </CardContent>

      <CardFooter className="justify-center border-t border-border/40 py-4 text-xs text-muted-foreground">
        <span>Bạn có thể chỉnh sửa thêm ảnh đại diện và liên kết sau trong Dashboard</span>
      </CardFooter>
    </Card>
  )
}
