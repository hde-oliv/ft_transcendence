import { z } from 'zod';

export const newMessageSchema = z
  .object({
    channel_id: z.number(),
    message: z.string(),
  })
  .required();

export type NewMessageDto = z.infer<typeof newMessageSchema>;
