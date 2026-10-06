import { z } from "zod"

export const leadFormSchema = z
  .object({
    name: z
      .string({ required_error: "Vui lòng nhập họ và tên của bạn" })
      .trim()
      .min(2, "Họ và tên cần ít nhất 2 ký tự")
      .max(80, "Họ và tên không quá 80 ký tự"),
    phone: z
      .string()
      .trim()
      .optional()
      .nullable()
      .refine(
        (val) => !val || /^(\+?[0-9\s.-]{8,20})$/.test(val),
        { message: "Số điện thoại không hợp lệ" }
      ),
    email: z
      .string()
      .trim()
      .optional()
      .nullable()
      .refine(
        (val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
        { message: "Email không đúng định dạng" }
      ),
    note: z
      .string()
      .trim()
      .max(500, "Lời nhắn không quá 500 ký tự")
      .optional()
      .nullable(),
    // Honeypot field để bẫy bot spam mà không cần captcha phiền toái
    honeypot: z.string().optional(),
  })
  .refine((data) => data.phone || data.email, {
    message: "Vui lòng nhập ít nhất Số điện thoại hoặc Email để chủ thẻ có thể liên hệ lại",
    path: ["phone"],
  })

export type LeadFormInput = z.infer<typeof leadFormSchema>
