import { Injectable } from '@nestjs/common';
import { FriendRepository } from './friend.repository';
import { CreateFriendshipDto } from './dto/create-friendship-dto';

@Injectable()
export class FriendService {
  constructor(private friendRepository: FriendRepository) {}

  async getAllFriendships() {
    return await this.friendRepository.getAllFriendships();
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
