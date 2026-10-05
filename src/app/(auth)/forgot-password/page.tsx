"use client"

import * as React from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations/auth"
import { forgotPasswordAction } from "@/actions/auth"

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
import { Button, buttonVariants } from "@/components/ui/button"
import { ArrowLeft, CheckCircle2, Loader2, Mail } from "lucide-react"

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = React.useState(false)
  const [isSuccess, setIsSuccess] = React.useState(false)
  const [submittedEmail, setSubmittedEmail] = React.useState("")

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  async function onSubmit(values: ForgotPasswordInput) {
    try {
      setIsLoading(true)
      const res = await forgotPasswordAction(values)

      if (res?.error) {
        toast.error(res.error)
        return
      }

      setSubmittedEmail(values.email)
      setIsSuccess(true)
      toast.success("Đã gửi liên kết đặt lại mật khẩu!")
    } catch {
      toast.error("Đã xảy ra sự cố khi gửi yêu cầu. Vui lòng thử lại sau.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <Card className="border-border/60 shadow-lg text-center">
        <CardHeader className="space-y-3 pb-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-500/10 text-blue-600">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Kiểm tra email của bạn
          </CardTitle>
          <CardDescription className="text-sm">
            Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến địa chỉ:
          </CardDescription>
          <div className="rounded-lg bg-muted p-2 font-medium text-foreground text-sm">
            {submittedEmail}
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-xs text-muted-foreground pb-6">
          <p>
            Vui lòng kiểm tra hộp thư đến (và thư mục Spam/Rác) và bấm vào liên kết trong email để đặt lại mật khẩu mới cho tài khoản của bạn.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 border-t border-border/40 pt-4">
          <Link href="/login" className={buttonVariants({ className: "w-full" })}>
            Quay lại Đăng nhập
          </Link>
          <Button
            variant="ghost"
            className="w-full text-xs text-muted-foreground"
            onClick={() => setIsSuccess(false)}
          >
            Gửi lại với email khác
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="border-border/60 shadow-lg">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">Quên mật khẩu</CardTitle>
        <CardDescription>
          Nhập email tài khoản của bạn để nhận liên kết đặt lại mật khẩu
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Địa chỉ Email đã đăng ký</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="tenban@example.com"
                        type="email"
                        autoComplete="email"
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
              Gửi liên kết đặt lại mật khẩu
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
          Quay lại Đăng nhập
        </Link>
      </CardFooter>
    </Card>
  )
}
