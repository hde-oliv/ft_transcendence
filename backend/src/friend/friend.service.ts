import { Injectable } from '@nestjs/common';
import { FriendRepository } from './friend.repository';
import { CreateFriendshipDto } from './dto/create-friendship-dto';
import { ReturnUserDto, returnUserSchema } from 'src/users/dto/return-user-dto';

@Injectable()
export class FriendService {
  constructor(private friendRepository: FriendRepository) { }

  async getAllFriendships(userId: string) {
    const friendships = await this.friendRepository.getAllFriendships(userId);
    const complete: Array<ReturnUserDto> = []
    friendships.forEach(e => {
      complete.push(returnUserSchema.parse(e.friend_one))
      complete.push(returnUserSchema.parse(e.friend_two))
    })

    return complete.filter(e => e.intra_login !== userId)
  }

  async getFriendshipById(id: string) {
    return await this.friendRepository.getFriendshipById(id);
  }

  async getFriendshipsByUser(user_id: string) {
    return await this.friendRepository.getFriendshipsByUser(user_id);
  }

  async createFriendship(new_friendship: CreateFriendshipDto) {
    return await this.friendRepository.createFriendship(new_friendship);
  }
}
