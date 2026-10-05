"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validations/auth"
import { resetPasswordAction } from "@/actions/auth"

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
import { ArrowLeft, Loader2, Lock } from "lucide-react"

export default function ResetPasswordPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  async function onSubmit(values: ResetPasswordInput) {
    try {
      setIsLoading(true)
      const res = await resetPasswordAction(values)

      if (res?.error) {
        toast.error(res.error)
        return
      }

      toast.success("Mật khẩu đã được thay đổi thành công!")
      if (res?.redirectTo) {
        router.push(res.redirectTo)
      } else {
        router.push("/login")
      }
    } catch {
      toast.error("Đã xảy ra sự cố khi đổi mật khẩu. Vui lòng thử lại.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-border/60 shadow-lg">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">Tạo mật khẩu mới</CardTitle>
        <CardDescription>
          Vui lòng thiết lập mật khẩu mới an toàn cho tài khoản của bạn
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mật khẩu mới</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Tối thiểu 6 ký tự"
                        type="password"
                        autoComplete="new-password"
                        disabled={isLoading}
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
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Xác nhận lại mật khẩu mới</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Nhập lại mật khẩu mới"
                        type="password"
                        autoComplete="new-password"
                        disabled={isLoading}
                        className="pl-9"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full h-10 mt-2 font-semibold" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Lưu mật khẩu mới
            </Button>
          </form>
        </Form>
      </CardContent>

      <CardFooter className="flex justify-center border-t border-border/40 pt-4">
        <Link
          href="/login"
          className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Hủy bỏ và quay lại Đăng nhập
        </Link>
      </CardFooter>
    </Card>
  )
}
