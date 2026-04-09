import { z } from 'zod';

export const feedbackSchema = z.object({
  isAnonymous: z.boolean(),
  name: z.string().trim().max(50).optional(),
  category: z.enum(['bug', 'feature', 'idea', 'other']),
  message: z.string().trim().min(10, '10文字以上で入力してください').max(1000),
  submittedAt: z.string().datetime(),
  honeypot: z.string().max(0).optional().default('')
}).superRefine((value, ctx) => {
  if (!value.isAnonymous && !value.name?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['name'],
      message: '匿名でない場合は名前が必要です'
    });
  }
});

export type FeedbackInput = z.infer<typeof feedbackSchema>;
