import { z } from 'zod';

export const updateChannelSchema = z.object({
  name: z.string().optional(),
  type: z.string().optional(),
  password: z.string().optional(),
  protected: z.boolean().optional(),
});

export type UpdateChannelDto = z.infer<typeof updateChannelSchema>;
