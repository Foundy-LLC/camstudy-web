import { RoomViewModel } from "@/stores/RoomStore";
import { io, Socket } from "socket.io-client";
import {
  BLOCK_USER,
  CLOSE_AUDIO_PRODUCER,
  CLOSE_VIDEO_PRODUCER,
  CONNECTION_SUCCESS,
  CONSUME,
  CONSUME_RESUME,
  CREATE_WEB_RTC_TRANSPORT,
  EDIT_AND_STOP_TIMER,
  GET_PRODUCER_IDS,
  HIDE_REMOTE_VIDEO,
  JOIN_ROOM,
  JOIN_WAITING_ROOM,
  KICK_USER,
  MUTE_HEADSET,
  NAME_SPACE,
  NEW_PRODUCER,
  OTHER_PEER_DISCONNECTED,
  OTHER_PEER_EXITED_ROOM,
  OTHER_PEER_JOINED_ROOM,
  PEER_STATE_CHANGED,
  PRODUCER_CLOSED,
  SEND_CHAT,
  SHOW_REMOTE_VIDEO,
  START_LONG_BREAK,
  START_SHORT_BREAK,
  START_TIMER,
  TRANSPORT_PRODUCER,
  TRANSPORT_PRODUCER_CONNECT,
  TRANSPORT_RECEIVER_CONNECT,
  UNBLOCK_USER,
  UNMUTE_HEADSET,
} from "@/constants/socketProtocol";
import { MediaKind, RtpParameters } from "mediasoup-client/lib/RtpParameters";
import { Device } from "mediasoup-client";
import {
  DtlsParameters,
  IceCandidate,
  IceParameters,
  Transport,
} from "mediasoup-client/lib/Transport";
import { Consumer } from "mediasoup-client/lib/Consumer";
import { Producer } from "mediasoup-client/lib/Producer";
import { PomodoroTimerEvent } from "@/models/room/PomodoroTimerEvent";
import { PomodoroTimerProperty } from "@/models/room/PomodoroTimerProperty";
import { ChatMessage } from "@/models/room/ChatMessage";
import { WaitingRoomData } from "@/models/room/WaitingRoomData";
import {
  OtherPeerExitedRoomEvent,
  OtherPeerJoinedRoomEvent,
} from "@/models/room/WaitingRoomEvent";
import { RoomJoiner } from "@/models/room/RoomJoiner";
import { JoinRoomSuccessCallbackProperty } from "@/models/room/JoinRoomSuccessCallbackProperty";
import { JoinRoomFailureCallbackProperty } from "@/models/room/JoinRoomFailureCallbackProperty";
import { PeerState } from "@/models/room/PeerState";
import userStore from "@/stores/UserStore";

const PORT = 2000;
const SOCKET_SERVER_URL = `http://localhost:${PORT}${NAME_SPACE}`;

interface CreateWebRtcTransportParams {
  readonly id: string;
  readonly iceParameters: IceParameters;
  readonly iceCandidates: IceCandidate[];
  readonly dtlsParameters: DtlsParameters;
}

interface ConsumeParams {
  readonly id: string;
  readonly producerId: string;
  readonly kind: MediaKind;
  readonly rtpParameters: RtpParameters;
  readonly serverConsumerId: string;
}

interface ReceiveTransportWrapper {
  receiveTransport: Transport;
  serverReceiveTransportId: string;
  producerId: string;
  userId: string;
  consumer: Consumer;
}

interface ErrorParams {
  error: any;
}

interface UserAndProducerId {
  producerId: string;
  userId: string;
}

export class RoomSocketService {
  private _socket?: Socket;

  private _sendTransport?: Transport;
  private _audioProducer?: Producer;
  private _videoProducer?: Producer;

  private _receiveTransportWrappers: ReceiveTransportWrapper[] = [];

  private _didGetInitialProducers: boolean = false;

  private _mutedHeadset: boolean = false;
  private _device?: Device;

  constructor(private readonly _roomViewModel: RoomViewModel) {}

  private _requireSocket = (): Socket => {
    if (this._socket === undefined) {
      throw Error("소켓이 초기화되지 않았습니다.");
    }
    return this._socket;
  };

  public connect = (roomId: string) => {
    if (this._socket != null) {
      return;
    }
    this._socket = io(SOCKET_SERVER_URL);
    this._socket.on(
      CONNECTION_SUCCESS,
      async ({ socketId }: { socketId: string }) => {
        console.log("Connected: ", socketId);
        await this._roomViewModel.onConnected();
        this._connectWaitingRoom(roomId);
      }
    );
  };

  private _connectWaitingRoom = (roomId: string) => {
    this._requireSocket().emit(
      JOIN_WAITING_ROOM,
      roomId,
      (waitingRoomData: WaitingRoomData) => {
        this._roomViewModel.onConnectedWaitingRoom(waitingRoomData);
        this._listenWaitingRoomEvents();
      }
    );
  };

  private _listenWaitingRoomEvents = () => {
    const socket = this._requireSocket();
    socket.on(OTHER_PEER_JOINED_ROOM, (joiner: RoomJoiner) => {
      this._roomViewModel.onWaitingRoomEvent(
        new OtherPeerJoinedRoomEvent(joiner)
      );
    });
    socket.on(OTHER_PEER_EXITED_ROOM, (userId: string) => {
      this._roomViewModel.onWaitingRoomEvent(
        new OtherPeerExitedRoomEvent(userId)
      );
    });
  };

  private _removeWaitingRoomEventsListener = () => {
    const socket = this._requireSocket();
    socket.removeListener(OTHER_PEER_JOINED_ROOM);
    socket.removeListener(OTHER_PEER_EXITED_ROOM);
  };

  public join = (localMediaStream: MediaStream, password: string) => {
    const socket = this._requireSocket();
    const user = userStore.currentUser;
    if (user == null) {
      throw Error("회원 정보가 없이 방 참여를 시도했습니다.");
    }
    socket.emit(
      JOIN_ROOM,
      {
        userId: user.id,
        roomPasswordInput: password,
      },
      async (
        data: JoinRoomSuccessCallbackProperty | JoinRoomFailureCallbackProperty
      ) => {
        if (data.type === "failure") {
          this._roomViewModel.onFailedToJoin(data.message);
          return;
        }
        console.log(`Router RTP Capabilities... ${data.rtpCapabilities}`);
        this._removeWaitingRoomEventsListener();
        this._roomViewModel.onJoined(
          data.peerStates,
          data.timerStartedDate,
          data.timerState,
          data.timerProperty
        );
        try {
          // once we have rtpCapabilities from the Router, create Device
          this._device = new Device();
          await this._device.load({
            routerRtpCapabilities: data.rtpCapabilities,
          });

          this._createSendTransport(this._device, localMediaStream);

          this._listenRoomEvents(this._device);
        } catch (e) {
          // TODO
        }
      }
    );
  };

  private _listenRoomEvents = (device: Device) => {
    const socket = this._requireSocket();
    socket.on(
      NEW_PRODUCER,
      async ({
        producerId,
        userId,
      }: {
        producerId: string;
        userId: string;
      }) => {
        await this._createReceiveTransport(producerId, userId, device);
      }
    );
    socket.on(SEND_CHAT, (message: ChatMessage) => {
      this._roomViewModel.onReceivedChat(message);
    });
    socket.on(
      OTHER_PEER_DISCONNECTED,
      ({ disposedPeerId }: { disposedPeerId: string }) => {
        this._roomViewModel.onDisposedPeer(disposedPeerId);
        this._receiveTransportWrappers = this._receiveTransportWrappers.filter(
          (wrapper) => wrapper.userId !== disposedPeerId
        );
      }
    );
    socket.on(PRODUCER_CLOSED, ({ remoteProducerId }) => {
      // server notification is received when a producer is closed
      // we need to close the client-side consumer and associated transport
      const receiveTransport = this._receiveTransportWrappers.find(
        (transportData) => transportData.producerId === remoteProducerId
      );
      if (receiveTransport === undefined) {
        return;
      }
      receiveTransport.consumer?.close();
    });
    socket.on(PEER_STATE_CHANGED, (state: PeerState) => {
      this._roomViewModel.onChangePeerState(state);
    });
    socket.on(START_TIMER, () => {
      this._roomViewModel.onPomodoroTimerEvent(PomodoroTimerEvent.ON_START);
    });
    socket.on(START_SHORT_BREAK, () => {
      this._roomViewModel.onPomodoroTimerEvent(
        PomodoroTimerEvent.ON_SHORT_BREAK
      );
    });
    socket.on(START_LONG_BREAK, () => {
      this._roomViewModel.onPomodoroTimerEvent(
        PomodoroTimerEvent.ON_LONG_BREAK
      );
    });
    socket.on(EDIT_AND_STOP_TIMER, (newProperty: PomodoroTimerProperty) => {
      this._roomViewModel.onUpdatedPomodoroTimer(newProperty);
    });
    socket.on(KICK_USER, this._roomViewModel.onKicked);
    socket.on(BLOCK_USER, this._roomViewModel.onBlocked);
  };

  private _createSendTransport = (
    device: Device,
    localMediaStream: MediaStream
  ) => {
    this._requireSocket().emit(
      CREATE_WEB_RTC_TRANSPORT,
      {
        isConsumer: false,
      },
      async (params: CreateWebRtcTransportParams) => {
        console.log(params);
        // creates a new WebRTC Transport to send media
        // based on the server's producer transport params
        // https://mediasoup.org/documentation/v3/mediasoup-client/api/#TransportOptions
        this._sendTransport = device.createSendTransport(params);

        // https://mediasoup.org/documentation/v3/communication-between-client-and-server/#producing-media
        // this event is raised when a first call to transport.produce() is made
        // see connectSendTransport() below
        this._sendTransport.on(
          "connect",
          async ({ dtlsParameters }, callback, errback) => {
            await this._onConnectedSendTransport(
              dtlsParameters,
              callback,
              errback
            );
          }
        );

        this._sendTransport.on(
          "produce",
          async (parameters, callback, errback) => {
            await this._onProducedSendTransport(
              device,
              parameters,
              callback,
              errback
            );
          }
        );

        await this._produceSendTransport(this._sendTransport, localMediaStream);
      }
    );
  };

  private _produceSendTransport = async (
    sendTransport: Transport,
    localMediaStream: MediaStream
  ) => {
    const audioTrack = localMediaStream.getAudioTracks()[0];
    if (audioTrack != null) {
      this._audioProducer = await sendTransport.produce({
        track: audioTrack,
      });
      // this._audioProducer.on("trackended", () => {
      //   console.log("audio track ended");
      //   // TODO: close audio track
      //
      // });
      this._audioProducer.on("transportclose", () => {
        console.log("audio transport ended");
        // close audio track
      });
    }

    const videoTrack = localMediaStream.getVideoTracks()[0];
    if (videoTrack != null) {
      this._videoProducer = await sendTransport.produce({
        track: videoTrack,
      });
      // this._videoProducer.on("trackended", () => {
      //   console.log("video track ended");
      //   // TODO: close video track
      // });
      this._videoProducer.on("transportclose", () => {
        console.log("video transport ended");
        // TODO: close video track
      });
    }
  };

  private _onConnectedSendTransport = async (
    dtlsParameters: DtlsParameters,
    callback: () => void,
    errback: (error: Error) => void
  ) => {
    try {
      // Signal local DTLS parameters to the server side transport
      // see server's socket.on('transport-producer-connect', ...)
      await this._requireSocket().emit(
        TRANSPORT_PRODUCER_CONNECT,
        dtlsParameters
      );
      // Tell the transport that parameters were transmitted.
      callback();
    } catch (error: any) {
      errback(error);
    }
  };

  private _onProducedSendTransport = async (
    device: Device,
    parameters: {
      kind: MediaKind;
      rtpParameters: RtpParameters;
      appData: Record<string, unknown>;
    },
    callback: ({ id }: { id: string }) => void,
    errback: (error: Error) => void
  ) => {
    try {
      // tell the server to create a Producer
      // with the following parameters and produce
      // and expect back a server side producer id
      // see server's socket.on('transport-produce', ...)
      await this._requireSocket().emit(
        TRANSPORT_PRODUCER,
        {
          kind: parameters.kind,
          rtpParameters: parameters.rtpParameters,
          appData: parameters.appData,
        },
        (id: string, producersExists: boolean) => {
          callback({ id });
          if (!this._didGetInitialProducers && producersExists) {
            this._didGetInitialProducers = true;
            this._getRemoteProducersAndCreateReceiveTransport(device);
          }
        }
      );
    } catch (error: any) {
      errback(error);
    }
  };

  private _getRemoteProducersAndCreateReceiveTransport = (device: Device) => {
    this._requireSocket().emit(
      GET_PRODUCER_IDS,
      (userProducerIds: UserAndProducerId[]) => {
        console.log(userProducerIds);
        // for each of the producer create a consumer
        // producerIds.forEach(id => signalNewConsumerTransport(id))
        userProducerIds.forEach(async (userProducerIdSet) => {
          await this._createReceiveTransport(
            userProducerIdSet.producerId,
            userProducerIdSet.userId,
            device
          );
        });
      }
    );
  };

  private _createReceiveTransport = async (
    remoteProducerId: string,
    userId: string,
    device: Device
  ) => {
    const receiveTransportWrapper = this._receiveTransportWrappers.find(
      (w) => w.userId === userId
    );
    if (receiveTransportWrapper?.receiveTransport !== undefined) {
      await this._consumeRecvTransport(
        receiveTransportWrapper.receiveTransport,
        remoteProducerId,
        receiveTransportWrapper.serverReceiveTransportId,
        userId,
        device
      );
      return;
    }

    this._requireSocket().emit(
      CREATE_WEB_RTC_TRANSPORT,
      { isConsumer: true },
      async (params: CreateWebRtcTransportParams) => {
        console.log(`PARAMS... ${params}`);

        let receiveTransport: Transport;
        try {
          receiveTransport = device.createRecvTransport(params);
        } catch (error) {
          // exceptions:
          // {InvalidStateError} if not loaded
          // {TypeError} if wrong arguments.
          console.log(error);
          return;
        }

        receiveTransport.on(
          "connect",
          async (
            { dtlsParameters }: { dtlsParameters: DtlsParameters },
            callback: () => void,
            errback: (e: any) => void
          ) => {
            try {
              // Signal local DTLS parameters to the server side transport
              // see server's socket.on('transport-recv-connect', ...)
              await this._requireSocket().emit(TRANSPORT_RECEIVER_CONNECT, {
                dtlsParameters,
                serverReceiveTransportId: params.id,
              });

              // Tell the transport that parameters were transmitted.
              callback();
            } catch (error) {
              // Tell the transport that something was wrong
              errback(error);
            }
          }
        );

        await this._consumeRecvTransport(
          receiveTransport,
          remoteProducerId,
          params.id,
          userId,
          device
        );
      }
    );
  };

  private _consumeRecvTransport = async (
    receiveTransport: Transport,
    remoteProducerId: string,
    serverReceiveTransportId: string,
    userId: string,
    device: Device
  ) => {
    // for consumer, we need to tell the server first
    // to create a consumer based on the rtpCapabilities and consume
    // if the router can consume, it will send back a set of params as below
    await this._requireSocket().emit(
      CONSUME,
      {
        rtpCapabilities: device.rtpCapabilities,
        remoteProducerId,
        serverReceiveTransportId: serverReceiveTransportId,
      },
      async (params: ConsumeParams | ErrorParams) => {
        if ((params as ErrorParams).error !== undefined) {
          params = params as ErrorParams;
          console.error("Cannot Consume", params.error);
          return;
        }
        params = params as ConsumeParams;

        if (params.kind === "audio" && this._mutedHeadset) {
          return;
        }

        console.log(`Consumer Params ${params}`);
        // then consume with the local consumer transport
        // which creates a consumer
        const consumer = await receiveTransport.consume(params);
        this._receiveTransportWrappers = [
          ...this._receiveTransportWrappers,
          {
            userId,
            receiveTransport,
            serverReceiveTransportId,
            producerId: remoteProducerId,
            consumer,
          },
        ];

        this._roomViewModel.onAddedConsumer(
          userId,
          consumer.track,
          params.kind
        );

        // the server consumer started with media paused,
        // so we need to inform the server to resume
        this._requireSocket().emit(CONSUME_RESUME, params.serverConsumerId);
      }
    );
  };

  public produceVideoTrack = async (track: MediaStreamTrack) => {
    if (this._sendTransport == null) {
      return;
    }
    this._videoProducer = await this._sendTransport.produce({ track });
  };

  public produceAudioTrack = async (track: MediaStreamTrack) => {
    if (this._sendTransport == null) {
      return;
    }
    this._audioProducer = await this._sendTransport.produce({ track });
  };

  public closeVideoProducer = () => {
    const producer = this._videoProducer;
    if (producer == null) {
      return;
    }
    producer.close();
    this._videoProducer = undefined;
    this._requireSocket().emit(CLOSE_VIDEO_PRODUCER);
  };

  public replaceVideoProducer = async (track: {
    track: MediaStreamTrack | null;
  }) => {
    const producer = this._videoProducer;
    if (producer == null) return;
    await producer.replaceTrack(track);
  };

  public closeAudioProducer = () => {
    const producer = this._audioProducer;
    if (producer == null) {
      return;
    }
    producer.close();
    this._audioProducer = undefined;
    this._requireSocket().emit(CLOSE_AUDIO_PRODUCER);
  };

  public replaceAudioProducer = async (track: {
    track: MediaStreamTrack | null;
  }) => {
    const producer = this._audioProducer;
    if (producer == null) return;
    await producer.replaceTrack(track);
  };

  public hideRemoteVideo = (userId: string) => {
    this._receiveTransportWrappers = this._receiveTransportWrappers.filter(
      (wrapper) => {
        if (wrapper.userId === userId && wrapper.consumer.kind === "video") {
          this._requireSocket().emit(HIDE_REMOTE_VIDEO, wrapper.producerId);
          wrapper.consumer.close();
          return false;
        }
        return true;
      }
    );
  };

  public showRemoteVideo = (userId: string) => {
    const socket = this._requireSocket();

    socket.emit(
      SHOW_REMOTE_VIDEO,
      userId,
      async (userAndProducerId: UserAndProducerId) => {
        if (this._device === undefined) {
          throw Error("Device 필드가 초기화 되지 않았습니다.");
        }
        await this._createReceiveTransport(
          userAndProducerId.producerId,
          userAndProducerId.userId,
          this._device
        );
      }
    );
  };

  public muteHeadset = () => {
    this._mutedHeadset = true;
    this._receiveTransportWrappers = this._receiveTransportWrappers.filter(
      (wrapper) => {
        if (wrapper.consumer.kind === "audio") {
          wrapper.consumer.close();
          return false;
        }
        return true;
      }
    );
    this._requireSocket().emit(MUTE_HEADSET);
  };

  public unmuteHeadset = () => {
    const socket = this._requireSocket();

    this._mutedHeadset = false;

    socket.emit(
      UNMUTE_HEADSET,
      async (userAndProducerIds: UserAndProducerId[]) => {
        if (this._device === undefined) {
          throw Error("Device 필드가 초기화 되지 않았습니다.");
        }
        for (const userAndProducerId of userAndProducerIds) {
          await this._createReceiveTransport(
            userAndProducerId.producerId,
            userAndProducerId.userId,
            this._device
          );
        }
      }
    );
  };

  public sendChat = (message: string) => {
    this._requireSocket().emit(SEND_CHAT, message);
  };

  public startTimer = () => {
    this._requireSocket().emit(START_TIMER);
  };

  public updateAndStopTimer = (newProperty: PomodoroTimerProperty) => {
    this._requireSocket().emit(EDIT_AND_STOP_TIMER, newProperty);
  };

  public kickUser = (userId: string) => {
    this._requireSocket().emit(KICK_USER, userId);
  };

  public blockUser = (userId: string) => {
    this._requireSocket().emit(BLOCK_USER, userId);
  };

  public unblockUser = (userId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      this._requireSocket().emit(
        UNBLOCK_USER,
        userId,
        (isSuccess: boolean, message: string) => {
          if (isSuccess) {
            resolve();
          } else {
            reject(message);
          }
        }
      );
    });
  };
}
