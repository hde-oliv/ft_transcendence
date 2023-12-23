import { Injectable, NotFoundException } from "@nestjs/common";

@Injectable()
export default class QueueService {
  constructor() {
    this.queue = new Map();
    this.invites = new Map();
  }
  private queue: Map<string, QueuRecord>;
  private invites: Map<string, boolean>;
  addToQueue(playerData: { intra_login: string, nickname: string, elo: number }) {
    if (this.queue.get(playerData.intra_login) === undefined)
      this.queue.set(playerData.intra_login, { nickname: playerData.nickname, elo: playerData.elo, joined: new Date() });
  }
  reAddToQueue(intra_login: string, queueRecord: QueuRecord) {
    this.queue.set(intra_login, queueRecord);
  }
  removeFromQueue(intra_login: string) {
    this.queue.delete(intra_login);
  }
  getQueueRecord(intra_login: string) {
    return this.queue.get(intra_login);
  }
  /**
   * Remove from queue all players that are not in the provided array
   * @param intra_logins
   */
  removeListFromQueue(intra_logins: Array<string>) {
    const removed: string[] = []
    this.queue.forEach((rec, key) => {
      if (!intra_logins.includes(key)) {
        this.queue.delete(key);
        removed.push(key);
      }
    })
    return removed;
  }
  queuedPlayerCount() {
    return this.queue.size;
  }
  queuedPlayers() {
    return Array.from(this.queue).map(([intra, data]) => { return { intra_login: intra, ...data } });
  }
  addInvite(intra_login: string) {
    this.invites.set(intra_login, false);
  }
  acceptQueueInvite(intra_login: string) {
    if (this.invites.get(intra_login) !== undefined)
      this.invites.set(intra_login, true);
    else
      throw new NotFoundException('Invite not found');
  }
  removeInvite(intra_login: string) {
    this.invites.delete(intra_login);
  }
  inviteStatus(intra_login: string) {
    return this.invites.get(intra_login) === true;
  }
}

export type QueuRecord = { joined: Date, elo: number, nickname: string }
