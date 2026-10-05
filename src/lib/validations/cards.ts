import { z } from 'zod';

export const activateCardSchema = z.object({
  code: z
    .string()
    .min(4, 'Mã thẻ phải có ít nhất 4 ký tự')
    .max(20, 'Mã thẻ tối đa 20 ký tự')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Mã thẻ chỉ chứa chữ cái, số và dấu gạch')
    .trim(),
});

export const updateCardNoteSchema = z.object({
  cardId: z.string().uuid('ID thẻ không hợp lệ'),
  note: z
    .string()
    .max(100, 'Ghi chú tối đa 100 ký tự')
    .optional()
    .transform((val) => (val && val.trim() !== '' ? val.trim() : null)),
});

export type ActivateCardFormData = z.infer<typeof activateCardSchema>;
export type UpdateCardNoteFormData = z.infer<typeof updateCardNoteSchema>;
