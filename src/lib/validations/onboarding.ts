import { z } from "zod"

export const onboardingSchema = z.object({
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
      "Username chỉ được chứa chữ cái thường (a-z), chữ số (0-9), dấu gạch dưới (_) hoặc dấu chấm (.)"
    ),
})

export type OnboardingInput = z.infer<typeof onboardingSchema>
