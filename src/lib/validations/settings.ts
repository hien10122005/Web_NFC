import { z } from 'zod';

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại'),
    newPassword: z.string().min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự'),
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu mới'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

export const changeEmailSchema = z.object({
  newEmail: z.string().email('Email mới không hợp lệ').trim().toLowerCase(),
});

export const deleteAccountSchema = z.object({
  confirmation: z
    .string()
    .min(1, 'Vui lòng nhập chữ xác nhận')
    .refine(
      (val) =>
        val.trim().toUpperCase() === 'XÓA TÀI KHOẢN' ||
        val.trim().toUpperCase() === 'DELETE',
      'Vui lòng nhập chính xác "XÓA TÀI KHOẢN" để xác nhận'
    ),
});

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type ChangeEmailFormData = z.infer<typeof changeEmailSchema>;
export type DeleteAccountFormData = z.infer<typeof deleteAccountSchema>;
