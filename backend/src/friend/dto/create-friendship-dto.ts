import { z } from 'zod';

export const createFriendshipSchema = z
  .object({
    fOne: z.string(),
    fTwo: z.string(),
  })
  .required();

export type CreateFriendshipDto = z.infer<typeof createFriendshipSchema>;
