import { z } from 'zod';

export const createChannelSchema = z
  .object({
    name: z.string(),
    type: z.string(),
    password: z.string(),
    protected: z.boolean(),
    user2user: z.boolean(),
    members: z.array(z.string()),
  })
  .required();

export type CreateChannelDto = z.infer<typeof createChannelSchema>;
