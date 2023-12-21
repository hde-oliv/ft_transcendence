import { Injectable } from "@nestjs/common";
import { matches } from "lodash";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class MatchRepository {
  constructor(private readonly prismaService: PrismaService) { }
  async createMatch(pOneId: string, ptwoId: string) {
    return this.prismaService.matches.create({
      data: {
        p_one: pOneId,
        p_two: ptwoId,
        p_one_score: 0,
        p_two_score: 0
      }
    })
  }
  async getMatchById(matchId: string) {
    return this.prismaService.matches.findUniqueOrThrow({
      where: {
        id: matchId
      }
    });
  }
  async incrementScoreById(matchId: string, player_tag: string) {
    const matchData = await this.prismaService.matches.findUniqueOrThrow({
      where: {
        id: matchId,
        OR: [
          {
            p_one: player_tag
          },
          {
            p_two: player_tag
          }
        ]
      }
    });
    if (matchData.p_one === player_tag)
      return this.prismaService.matches.update({
        where: {
          id: matchId,
          p_one: player_tag
        },
        data: {
          p_one_score: {
            increment: 1
          }
        }
      })
    else
      return this.prismaService.matches.update({
        where: {
          id: matchId,
          p_two: player_tag
        },
        data: {
          p_two_score: {
            increment: 1
          }
        }
      })
  }
  async getMatchesByUser(intra_tag: string) {
    return this.prismaService.matches.findMany({
      where: {
        OR: [
          {
            p_one: intra_tag
          },
          {
            p_two: intra_tag
          }
        ]
      },
      orderBy: {
        start: "desc"
      }
    })
  }
  async getWinCountByUser(intra_tag: string) {
    return this.prismaService.matches.count({
      where: {
        AND: [
          {
            NOT: {
              end: null
            }
          },
          {
            OR: [
              {
                AND: [
                  {
                    p_one: intra_tag
                  },
                  {
                    p_one_score: {
                      gt: this.prismaService.matches.fields.p_two_score
                    }
                  }
                ]
              },
              {
                AND: [
                  {
                    p_two: intra_tag
                  },
                  {
                    p_two_score: {
                      gt: this.prismaService.matches.fields.p_one_score
                    }
                  }
                ]
              }
            ]
          }
        ]
      }
    });
  }
  async getLossCountByUser(intra_tag: string) {
    return this.prismaService.matches.count({
      where: {
        AND: [
          {
            NOT: {
              end: null
            }
          },
          {
            OR: [
              {
                AND: [
                  {
                    p_one: intra_tag
                  },
                  {
                    p_one_score: {
                      lt: this.prismaService.matches.fields.p_two_score
                    }
                  }
                ]
              },
              {
                AND: [
                  {
                    p_two: intra_tag
                  },
                  {
                    p_two_score: {
                      lt: this.prismaService.matches.fields.p_one_score
                    }
                  }
                ]
              }
            ]
          }
        ]
      }
    });
  }
  async getTieCountByUser(intra_tag: string) {
    return this.prismaService.matches.count({
      where: {
        AND: [
          {
            NOT: {
              end: null
            }
          },
          {
            OR: [
              {
                AND: [
                  {
                    p_one: intra_tag
                  },
                  {
                    p_one_score: {
                      equals: this.prismaService.matches.fields.p_two_score
                    }
                  }
                ]
              },
              {
                AND: [
                  {
                    p_two: intra_tag
                  },
                  {
                    p_two_score: {
                      equals: this.prismaService.matches.fields.p_one_score
                    }
                  }
                ]
              }
            ]
          }
        ]
      }
    });
  }
  async getStatsByUser(intra_tag: string) {
    const matches = await this.prismaService.matches.findMany({
      where: {
        OR: [
          { p_one: intra_tag },
          { p_two: intra_tag }
        ]
      }
    })
    const response = {
      win: 0,
      loss: 0,
      tie: 0,
      indeterminate: 0
    }
    const aggregated = matches.map(e => {
      const myScore = e.p_one === intra_tag ? e.p_one_score : e.p_two_score;
      const adScore = e.p_one === intra_tag ? e.p_two_score : e.p_one_score;
      let status: 'indeterminate' | 'win' | 'tie' | 'loss' = 'indeterminate';
      if (e.end !== null) {
        if (myScore - adScore > 0)
          status = 'win'
        else if (myScore - adScore === 0)
          status = 'tie'
        else
          status = 'loss'
      }
      return {
        defined: e.end !== null,
        status
      }
    });
    aggregated.forEach(rec => {
      switch (rec.status) {
        case ('indeterminate'):
          response.indeterminate++;
          break;
        case ('win'):
          response.win++;
          break;
        case ('tie'):
          response.tie++;
          break;
        case ('loss'):
          response.loss++;
          break;
      }
    })
    return response;
  }
  async deleteMatchById(matchId: string) {
    return this.prismaService.matches.delete({
      where: {
        id: matchId
      }
    })
  }
  async deleteHungMatches() {
    return this.prismaService.matches.deleteMany({
      where: {
        NOT: {
          end: null
        }
      }
    })
  }
}
