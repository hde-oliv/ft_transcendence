import { Injectable } from '@nestjs/common';
import { FriendRepository } from './friend.repository';
import { CreateFriendshipDto } from './dto/create-friendship-dto';
import { ReturnUserDto, returnUserSchema } from 'src/users/dto/return-user-dto';
import { ChatService } from 'src/chat/chat.service';
import { TokenClaims } from 'src/auth/auth.model';
import { v4 as uuidv4 } from 'uuid';
import { WebsocketService } from 'src/chat/websocket.service';

@Injectable()
export class FriendService {
  constructor(
    private friendRepository: FriendRepository,
    private chatService: ChatService,
    private socketService: WebsocketService
  ) { }
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
    const logins: string[] = [new_friendship.fOne, new_friendship.fTwo];
    const ordered = logins.sort();
    let orderedFriendShip: CreateFriendshipDto = {
      fOne: ordered[0],
      fTwo: ordered[1]
    }
    await this.friendRepository.createFriendship(orderedFriendShip);

    let another_user: string;

    if (token.intra_login === new_friendship.fOne) {
      another_user = new_friendship.fTwo;
    } else {
      another_user = new_friendship.fOne;
    }

    const newChannel = await this.chatService.createChannel(token, {
      type: 'private',
      name: String(uuidv4()),
      password: '',
      protected: false,
      user2user: true,
      members: [another_user],
    });
    this.socketService.emitToUser(another_user, 'addedAsFriend', { name: token.nickname })
  }
}
