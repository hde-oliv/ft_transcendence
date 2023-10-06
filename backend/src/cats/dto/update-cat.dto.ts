import { z } from 'zod';

export const updateCatSchema = z
  .object({
    name: z.string(),
    age: z.number(),
    breed: z.string(),
  })
  .required();

export type UpdateCatDto = z.infer<typeof updateCatSchema>;
