import { z } from 'zod';

const enableChannelPassword = z.object({
  password: z.string(),
  protected: z.literal(true)
})
const disableChannelPassword = z.object({
  protected: z.literal(false)
})

export const updateChannelPassword = z.discriminatedUnion('protected', [enableChannelPassword, disableChannelPassword]);


export const updateChannelData = z.object({
  name: z.string().optional(),
  type: z.string().optional(),
}).refine((val) => {
  const { name, type } = val;
  return !(name === undefined && type === undefined);
}, { message: 'name or type must be provided' })

export const updateChannelSchema = updateChannelData.or(updateChannelPassword);

export type UpdateChannelDto = z.infer<typeof updateChannelSchema>;
