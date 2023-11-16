import { Injectable } from '@nestjs/common';
import { FriendRepository } from './friend.repository';
import { CreateFriendshipDto } from './dto/create-friendship-dto';
import { ChatService } from 'src/chat/chat.service';
import { TokenClaims } from 'src/auth/auth.model';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FriendService {
  constructor(
    private friendRepository: FriendRepository,
    private chatService: ChatService,
  ) {}

  async getAllFriendships() {
    return await this.friendRepository.getAllFriendships();
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
    await this.friendRepository.createFriendship(new_friendship);

    let another_user: string;

    if (token.intra_login === new_friendship.fOne) {
      another_user = new_friendship.fTwo;
    } else {
      another_user = new_friendship.fOne;
    }

    await this.chatService.createChannel(token, {
      type: 'private',
      name: String(uuidv4()),
      password: '',
      protected: false,
      user2user: true,
      members: [another_user],
    });
  }
}
