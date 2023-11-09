import { Injectable } from '@nestjs/common';
import { FriendRepository } from './friend.repository';
import { CreateFriendshipDto } from './dto/create-friendship-dto';

@Injectable()
export class FriendService {
  constructor(private friendRepository: FriendRepository) {}

  async getAllFriendships() {
    return await this.getAllFriendships();
  }

  async getFriendshipById(id: string) {
    return await this.getFriendshipById(id);
  }

  async getFriendshipsByUser(user_id: string) {
    return await this.getFriendshipsByUser(user_id);
  }

  async createFriendship(new_friendship: CreateFriendshipDto) {
    return await this.createFriendship(new_friendship);
  }
}
