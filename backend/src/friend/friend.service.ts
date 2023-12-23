import { ConflictException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { FriendRepository } from './friend.repository';
import { CreateFriendshipDto } from './dto/create-friendship-dto';
import { ReturnUserDto, returnUserSchema } from 'src/users/dto/return-user-dto';
import { ChatService } from 'src/chat/chat.service';
import { TokenClaims } from 'src/auth/auth.model';
import { v4 as uuidv4 } from 'uuid';
import { WebsocketService } from 'src/chat/websocket.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class FriendService {
  constructor(
    private friendRepository: FriendRepository,
    private chatService: ChatService,
    private socketService: WebsocketService
  ) { }
  private readonly logger = new Logger(FriendService.name);
  async getAllFriendships(userId: string) {
    const friendships = await this.friendRepository.getAllFriendships(userId);
    const complete: Array<ReturnUserDto> = [];
    friendships.forEach((e) => {
      complete.push(returnUserSchema.parse(e.friend_one));
      complete.push(returnUserSchema.parse(e.friend_two));
    });

    return complete.filter((e) => e.intra_login !== userId);
  }

  async getFriendshipById(id: string) {
    return await this.friendRepository.getFriendshipById(id);
  }

  async getFriendshipsByUser(user_id: string) {
    return await this.friendRepository.getFriendshipsByUser(user_id);
  }

  async createFriendship(
    token: TokenClaims,
    new_friendship: CreateFriendshipDto,
  ) {
    let friendshipRecord: { friendship: { id: string; fOne: string; fTwo: string; }, new: boolean } | null = null
    const logins: string[] = [new_friendship.fOne, new_friendship.fTwo];
    const ordered = logins.sort();
    let orderedFriendShip: CreateFriendshipDto = {
      fOne: ordered[0],
      fTwo: ordered[1]
    }
    let another_user: string;
    if (token.intra_login === orderedFriendShip.fOne) {
      another_user = orderedFriendShip.fTwo;
    } else {
      another_user = orderedFriendShip.fOne;
    }

    try {
      friendshipRecord = { friendship: await this.friendRepository.createFriendship(orderedFriendShip), new: true };
      const newChannel = await this.chatService.createChannel(token, {
        type: 'private',
        name: String(uuidv4()),
        password: '',
        protected: false,
        user2user: true,
        members: [another_user],
      });
      this.socketService.emitToUser(another_user, 'addedAsFriend', { name: token.nickname })
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          try {
            friendshipRecord = { friendship: (await this.friendRepository.getFriendshipByUsers(orderedFriendShip.fOne, orderedFriendShip.fTwo)), new: false };
          } catch (f) {
            throw new NotFoundException('Could not create friendship, nor find an existing relation');
          }
        }
        else
          throw new InternalServerErrorException()
      }
    }
    return friendshipRecord;
  }
}
