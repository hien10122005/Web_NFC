import { z } from 'zod';

export const themeSchema = z.object({
  preset: z.string().min(1),
  primaryColor: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Mã màu không hợp lệ'),
  backgroundColor: z.string().min(1),
  backgroundType: z.enum(['color', 'gradient', 'dark']),
  cardStyle: z.enum(['rounded', 'pill', 'sharp', 'glass']),
  buttonStyle: z.enum(['filled', 'outline', 'soft', 'glass']),
  fontFamily: z.enum(['system', 'serif', 'mono']),
});

export type ThemeData = z.infer<typeof themeSchema>;
