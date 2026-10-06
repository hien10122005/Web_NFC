import { z } from "zod"

export const visibilitySchema = z.object({
  job_title: z.boolean(),
  organization: z.boolean(),
  bio: z.boolean(),
  phone: z.boolean(),
  email: z.boolean(),
  address: z.boolean(),
  lead_form: z.boolean(),
})

export type VisibilityInput = z.infer<typeof visibilitySchema>

export const profileSchema = z.object({
  fullName: z
    .string({ required_error: "Vui lòng nhập họ và tên" })
    .trim()
    .min(2, "Họ và tên phải có ít nhất 2 ký tự")
    .max(60, "Họ và tên không được vượt quá 60 ký tự"),
  username: z
    .string({ required_error: "Vui lòng nhập username" })
    .trim()
    .toLowerCase()
    .min(3, "Username phải có ít nhất 3 ký tự")
    .max(30, "Username không được vượt quá 30 ký tự")
    .regex(
      /^[a-z0-9_.]+$/,
      "Username chỉ gồm chữ thường (a-z), chữ số (0-9), dấu gạch dưới (_) hoặc dấu chấm (.)"
    ),
  jobTitle: z.string().max(100, "Chức danh không quá 100 ký tự").optional().nullable(),
  organization: z.string().max(100, "Đơn vị không quá 100 ký tự").optional().nullable(),
  bio: z.string().max(500, "Tiểu sử không quá 500 ký tự").optional().nullable(),
  phone: z
    .string()
    .max(20, "Số điện thoại không quá 20 ký tự")
    .optional()
    .nullable()
    .refine((val) => !val || /^(\+?[0-9\s.-]{7,20})$/.test(val), {
      message: "Số điện thoại không hợp lệ",
    }),
  emailPublic: z
    .string()
    .optional()
    .nullable()
    .refine((val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
      message: "Email công khai không đúng định dạng",
    }),
  address: z.string().max(200, "Địa chỉ không quá 200 ký tự").optional().nullable(),
  isPublic: z.boolean(),
  visibility: visibilitySchema,
})

export type ProfileInput = z.infer<typeof profileSchema>
