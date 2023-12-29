import z, { boolean } from "zod";


const ballData = z.object({
  x: z.number(),
  y: z.number()
})
const score = z.object({
  pOne: z.number().int(),
  pTwo: z.number().int()
})
const paddles = z.object({
  pOne: z.number(),
  pTwo: z.number()
})
const playerdata = z.object({
  id: z.string(),
  nickname: z.string(),
  connected: z.boolean()
})
const gameData = z.object({
  gameId: z.string(),
  playerOne: playerdata,
  playerTwo: playerdata,
  ballData: ballData,
  score: score,
  paddles: paddles,
  status: z.enum(['ok', 'aborted']),
  ended: z.date().nullable()
})
const movePaddleCmd = z.object({
  type: z.literal('movePaddle'),
  gameId: z.string(),
  dir: z.number()
})
const connectedGameCmd = z.object({
  type: z.literal('connected'),
  connected: z.boolean(),
  gameId: z.string()
})
const pauseGameCmd = z.object({
  type: z.literal('pause'),
  gameId: z.string(),
  paused: z.boolean()
})
const quitGameCmd = z.object({
  type: z.literal('quit'),
  gameId: z.string()
})

export const playerActionPayload = z.discriminatedUnion('type', [movePaddleCmd, connectedGameCmd, pauseGameCmd, quitGameCmd])
export type PlayerActionPayload = z.infer<typeof playerActionPayload>

export type GameState = z.infer<typeof gameData>
export enum RacketDirection {
  DEFAULT = 1,
  INVERTED = 2,
  STRAIGHT = 3
}
export enum YAxisDirection {
  UP = -1,
  DOWN = 1
}
