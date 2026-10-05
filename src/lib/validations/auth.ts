import { z } from "zod"

export const loginSchema = z.object({
  email: z
    .string({ required_error: "Vui lòng nhập địa chỉ email" })
    .min(1, "Vui lòng nhập địa chỉ email")
    .email("Email không đúng định dạng"),
  password: z
    .string({ required_error: "Vui lòng nhập mật khẩu" })
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
})

export type LoginInput = z.infer<typeof loginSchema>

export const registerSchema = z
  .object({
    fullName: z
      .string({ required_error: "Vui lòng nhập họ và tên" })
      .min(2, "Họ và tên phải có ít nhất 2 ký tự")
      .max(60, "Họ và tên không được vượt quá 60 ký tự"),
    email: z
      .string({ required_error: "Vui lòng nhập địa chỉ email" })
      .min(1, "Vui lòng nhập địa chỉ email")
      .email("Email không đúng định dạng"),
    password: z
      .string({ required_error: "Vui lòng nhập mật khẩu" })
      .min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    confirmPassword: z
      .string({ required_error: "Vui lòng xác nhận mật khẩu" })
      .min(1, "Vui lòng xác nhận lại mật khẩu"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không trùng khớp",
    path: ["confirmPassword"],
  })

export type RegisterInput = z.infer<typeof registerSchema>

export const forgotPasswordSchema = z.object({
  email: z
    .string({ required_error: "Vui lòng nhập địa chỉ email" })
    .min(1, "Vui lòng nhập địa chỉ email")
    .email("Email không đúng định dạng"),
})

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>

export const resetPasswordSchema = z
  .object({
    password: z
      .string({ required_error: "Vui lòng nhập mật khẩu mới" })
      .min(6, "Mật khẩu mới phải có ít nhất 6 ký tự"),
    confirmPassword: z
      .string({ required_error: "Vui lòng xác nhận mật khẩu" })
      .min(1, "Vui lòng xác nhận lại mật khẩu"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không trùng khớp",
    path: ["confirmPassword"],
  })

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
