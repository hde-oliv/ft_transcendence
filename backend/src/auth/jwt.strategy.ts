import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { jwtConstants } from './auth.constants';
import { PrismaService } from 'src/prisma/prisma.service';
import { TokenClaims, tokenClaimsSchema } from './auth.model';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly prismaService: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }
  async validate(payload: any): Promise<TokenClaims> {
    try {
      const userData = tokenClaimsSchema.parse(payload)
      await this.prismaService.users.findUniqueOrThrow({
        where: {
          intra_login: userData.intra_login
        }
      })
      return userData;
    } catch (e) {
      throw new UnauthorizedException('User does not exist');
    }
  }
}
