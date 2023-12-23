import z from "zod";


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
const gameData = z.object({
  ballData: ballData,
  score: score,
  paddles: paddles
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
