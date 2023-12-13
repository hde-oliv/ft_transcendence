import { Module } from "@nestjs/common";
import QueueService from "./queue.service";

@Module({
  providers: [QueueService],
  controllers: [],
  imports: [],
  exports: [QueueService]
})
export class QueueModule { }
