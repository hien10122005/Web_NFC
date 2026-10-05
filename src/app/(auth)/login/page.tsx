"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { loginSchema, type LoginInput } from "@/lib/validations/auth"
import { loginAction } from "@/actions/auth"
import { createClient } from "@/lib/supabase/client"

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
import { Loader2, Lock, Mail } from "lucide-react"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextUrl = searchParams.get("next") || "/dashboard"
  const messageParam = searchParams.get("message")
  const errorParam = searchParams.get("error")

  const [isLoading, setIsLoading] = React.useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false)

  React.useEffect(() => {
    if (messageParam) {
      toast.info(messageParam)
    }
    if (errorParam) {
      toast.error(errorParam)
    }
  }, [messageParam, errorParam])

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: LoginInput) {
    try {
      setIsLoading(true)
      const res = await loginAction(values)

      if (res?.error) {
        toast.error(res.error)
        return
      }

      toast.success("Đăng nhập thành công!")
      if (res?.redirectTo) {
        router.push(res.redirectTo)
      } else {
        router.push(nextUrl)
      }
      router.refresh()
    } catch {
      toast.error("Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleGoogleLogin() {
    try {
      setIsGoogleLoading(true)
      const supabase = createClient()
      const siteUrl = window.location.origin
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(nextUrl)}`,
        },
      })
      if (error) {
        toast.error("Không thể đăng nhập bằng Google: " + error.message)
      }
    } catch {
      toast.error("Lỗi kết nối tới dịch vụ Google.")
    } finally {
      setIsGoogleLoading(false)
    }
  }

  return (
    <Card className="border-border/60 shadow-lg">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">Đăng nhập</CardTitle>
        <CardDescription>
          Nhập địa chỉ email và mật khẩu để truy cập tài khoản của bạn
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Google OAuth Button */}
        <Button
          variant="outline"
          type="button"
          className="w-full h-10 font-medium"
          onClick={handleGoogleLogin}
          disabled={isGoogleLoading || isLoading}
        >
          {isGoogleLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                fill="#EA4335"
              />
            </svg>
          )}
          Đăng nhập với Google
        </Button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/60" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Hoặc tiếp tục với email
            </span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Địa chỉ Email</FormLabel>
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

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Mật khẩu</FormLabel>
                    <Link
                      href="/forgot-password"
                      className="text-xs text-primary hover:underline font-medium"
                    >
                      Quên mật khẩu?
                    </Link>
                  </div>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="••••••••"
                        type="password"
                        autoComplete="current-password"
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
              Đăng nhập
            </Button>
          </form>
        </Form>
      </CardContent>

      <CardFooter className="flex justify-center border-t border-border/40 pt-4 text-sm text-muted-foreground">
        <span>Chưa có tài khoản? </span>
        <Link href="/register" className="ml-1.5 font-semibold text-primary hover:underline">
          Đăng ký ngay
        </Link>
      </CardFooter>
    </Card>
  )
}

export default function LoginPage() {
  return (
    <React.Suspense
      fallback={
        <Card className="border-border/60 shadow-lg p-8 text-center text-muted-foreground">
          <Loader2 className="mx-auto h-8 w-8 animate-spin" />
        </Card>
      }
    >
      <LoginForm />
    </React.Suspense>
  )
}
