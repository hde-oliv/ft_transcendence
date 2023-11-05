import { z } from 'zod';

export const sendMessageSchema = z
  .object({
    channel_name: z.string(),
    message: z.string(),
  })
  .required();

export type SendMessageDto = z.infer<typeof sendMessageSchema>;
