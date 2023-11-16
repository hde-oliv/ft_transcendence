import { UnauthorizedException } from "@nestjs/common"
import { TokenClaims, tokenClaimsSchema } from "src/auth/auth.model"

export default function userFromReq(req: any): TokenClaims {
  try {
    return tokenClaimsSchema.parse(req.user);
  } catch (e) {
    throw new UnauthorizedException();
  }
}