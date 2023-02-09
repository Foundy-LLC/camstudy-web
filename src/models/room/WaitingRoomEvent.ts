import { RoomJoiner } from "@/models/room/RoomJoiner";

export abstract class WaitingRoomEvent {}

export class OtherPeerJoinedRoomEvent extends WaitingRoomEvent {
  constructor(readonly joiner: RoomJoiner) {
    super();
  }
}

export class OtherPeerExitedRoomEvent extends WaitingRoomEvent {
  constructor(readonly exitedUserId: string) {
    super();
  }
}
