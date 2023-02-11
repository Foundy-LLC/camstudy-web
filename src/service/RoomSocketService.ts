import { RoomViewModel } from "@/stores/RoomStore";
import { io, Socket } from "socket.io-client";
import {
  CLOSE_AUDIO_PRODUCER,
  CLOSE_VIDEO_PRODUCER,
  CONNECTION_SUCCESS,
  CONSUME,
  CONSUME_RESUME,
  CREATE_WEB_RTC_TRANSPORT,
  EDIT_AND_STOP_TIMER,
  GET_PRODUCER_IDS,
  JOIN_ROOM,
  JOIN_WAITING_ROOM,
  NAME_SPACE,
  NEW_PRODUCER,
  OTHER_PEER_DISCONNECTED,
  OTHER_PEER_EXITED_ROOM,
  OTHER_PEER_JOINED_ROOM,
  PRODUCER_CLOSED,
  SEND_CHAT,
  START_LONG_BREAK,
  START_SHORT_BREAK,
  START_TIMER,
  TRANSPORT_PRODUCER,
  TRANSPORT_PRODUCER_CONNECT,
  TRANSPORT_RECEIVER_CONNECT,
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
import { auth } from "@/service/firebase";
import { PomodoroTimerEvent } from "@/models/room/PomodoroTimerEvent";
import { PomodoroTimerProperty } from "@/models/room/PomodoroTimerProperty";
import { ChatMessage } from "@/models/room/ChatMessage";
import { uuidv4 } from "@firebase/util";
import { WaitingRoomData } from "@/models/room/WaitingRoomData";
import {
  OtherPeerExitedRoomEvent,
  OtherPeerJoinedRoomEvent,
} from "@/models/room/WaitingRoomEvent";
import { RoomJoiner } from "@/models/room/RoomJoiner";
import { JoinRoomSuccessCallbackProperty } from "@/models/room/JoinRoomSuccessCallbackProperty";
import { JoinRoomFailureCallbackProperty } from "@/models/room/JoinRoomFailureCallbackProperty";

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

export class RoomSocketService {
  private _socket?: Socket;

  private _sendTransport?: Transport;
  private _audioProducer?: Producer;
  private _videoProducer?: Producer;

  private readonly _consumingTransportIds: Set<string> = new Set();
  private _receiveTransportWrappers: ReceiveTransportWrapper[] = [];

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
    const user = auth.currentUser;
    if (user == null) {
      throw Error("회원 정보가 없이 방 참여를 시도했습니다.");
    }
    socket.emit(
      JOIN_ROOM,
      {
        userId: user.uid,
        // TODO: 실제 회원 이름을 전달하기
        userName: uuidv4(),
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
          data.timerStartedDate,
          data.timerState,
          data.timerProperty
        );
        try {
          // once we have rtpCapabilities from the Router, create Device
          const device = new Device();
          await device.load({ routerRtpCapabilities: data.rtpCapabilities });

          this._createSendTransport(device, localMediaStream);

          this._listenRoomEvents(device);
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
      async ({ params }: { params: CreateWebRtcTransportParams }) => {
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
      this._audioProducer.on("trackended", () => {
        console.log("audio track ended");
        // TODO: close audio track
      });
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
      this._videoProducer.on("trackended", () => {
        console.log("video track ended");
        // TODO: close video track
      });
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
      await this._requireSocket().emit(TRANSPORT_PRODUCER_CONNECT, {
        dtlsParameters,
      });
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
        ({ id, producersExist }: { id: string; producersExist: boolean }) => {
          // Tell the transport that parameters were transmitted and provide it with the
          // server side producer's id.
          callback({ id });
          // if producers exist, then join room
          if (producersExist)
            this._getRemoteProducersAndCreateReceiveTransport(device);
        }
      );
    } catch (error: any) {
      errback(error);
    }
  };

  private _getRemoteProducersAndCreateReceiveTransport = (device: Device) => {
    this._requireSocket().emit(
      GET_PRODUCER_IDS,
      (userProducerIds: { producerId: string; userId: string }[]) => {
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
    if (this._consumingTransportIds.has(remoteProducerId)) {
      return;
    }
    this._consumingTransportIds.add(remoteProducerId);

    await this._requireSocket().emit(
      CREATE_WEB_RTC_TRANSPORT,
      { isConsumer: true },
      ({ params }: { params: CreateWebRtcTransportParams }) => {
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

        this._connectRecvTransport(
          receiveTransport,
          remoteProducerId,
          params.id,
          userId,
          device
        );
      }
    );
  };

  private _connectRecvTransport = async (
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
      async ({ params }: { params: ConsumeParams | ErrorParams }) => {
        if ((params as ErrorParams).error !== undefined) {
          params = params as ErrorParams;
          console.error("Cannot Consume", params.error);
          return;
        }
        params = params as ConsumeParams;

        console.log(`Consumer Params ${params}`);
        // then consume with the local consumer transport
        // which creates a consumer
        const consumer = await receiveTransport.consume(params);
        this._receiveTransportWrappers = [
          ...this._receiveTransportWrappers,
          {
            userId,
            receiveTransport,
            serverReceiveTransportId: params.id,
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
        this._requireSocket().emit(CONSUME_RESUME, {
          serverConsumerId: params.serverConsumerId,
        });
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

  public closeAudioProducer = () => {
    const producer = this._audioProducer;
    if (producer == null) {
      return;
    }
    producer.close();
    this._audioProducer = undefined;
    this._requireSocket().emit(CLOSE_AUDIO_PRODUCER);
  };

  public sendChat = (message: string) => {
    this._requireSocket().emit(SEND_CHAT, message);
  };

  public startTimer = () => {
    this._requireSocket().emit(START_TIMER);
  };

  public updateAndStopTimer(newProperty: PomodoroTimerProperty) {
    this._requireSocket().emit(EDIT_AND_STOP_TIMER, newProperty);
  }
}
