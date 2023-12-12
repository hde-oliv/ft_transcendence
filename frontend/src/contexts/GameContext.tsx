import { createContext } from "react";
import { boolean } from "zod";

interface GameContextProps {
  gameOver: boolean;
}

export const GameContext = createContext<GameContextProps>({
  gameOver: false,
});
