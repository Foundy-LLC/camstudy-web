import { ChatMessage, RoomViewModel } from "@/stores/RoomStore";
import { io, Socket } from "socket.io-client";
import {
  CLOSE_AUDIO_PRODUCER,
  CLOSE_VIDEO_PRODUCER,
  CONNECTION_SUCCESS,
  CONSUME,
  CONSUME_RESUME,
  CREATE_WEB_RTC_TRANSPORT,
  GET_PRODUCER_IDS,
  JOIN_ROOM,
  NAME_SPACE,
  NEW_PRODUCER,
  OTHER_PEER_DISCONNECTED,
  PRODUCER_CLOSED,
  SEND_CHAT,
  TRANSPORT_PRODUCER,
  TRANSPORT_PRODUCER_CONNECT,
  TRANSPORT_RECEIVER_CONNECT,
} from "@/constants/socketProtocol";
import {
  MediaKind,
  RtpCapabilities,
  RtpParameters,
} from "mediasoup-client/lib/RtpParameters";
import { Device } from "mediasoup-client";
import {
  DtlsParameters,
  IceCandidate,
  IceParameters,
  Transport,
} from "mediasoup-client/lib/Transport";
import { Consumer } from "mediasoup-client/lib/Consumer";
import { uuidv4 } from "@firebase/util";
import { Producer } from "mediasoup-client/lib/Producer";
import { InvalidStateError } from "mediasoup-client/lib/errors";

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

interface ErrorParams {
  error: any;
}

export class RoomSocketService {
  private _socket?: Socket;

  private _sendTransport?: Transport;
  private _audioProducer?: Producer;
  private _videoProducer?: Producer;

  private _consumingTransportIds: Set<string> = new Set();
  private _consumerTransports: {
    consumerTransport: Transport;
    serverConsumerTransportId: string;
    producerId: string;
    userId: string;
    consumer: Consumer;
  }[] = [];

  constructor(private readonly _roomViewModel: RoomViewModel) {}

  private _requireSocket = (): Socket => {
    if (this._socket === undefined) {
      throw Error("소켓이 초기화되지 않았습니다.");
    }
    return this._socket;
  };

  public connect = () => {
    if (this._socket != null) {
      return;
    }
    this._socket = io(SOCKET_SERVER_URL);
    this._socket.on(
      CONNECTION_SUCCESS,
      async ({ socketId }: { socketId: string }) => {
        console.log("Connected: ", socketId);
        const localMediaStream = await this._roomViewModel.onConnected();
        // TODO: 바로 방에 접속하지 않고 준비 화면에서 회원이 접속 버튼을 눌러야지 접속되도록 한다. 준비 화면에서는 로컬 비디오, 음성을 확인해야한다.
        // TODO: 임시 방이름 말고 진짜 방이름으로 변경하기([roomId] 이용)
        this.join("roomName", localMediaStream);
      }
    );
  };

  public join = (roomName: string, localMediaStream: MediaStream) => {
    const socket = this._requireSocket();
    socket.emit(
      JOIN_ROOM,
      {
        roomName: roomName,
        // TODO: 실제 회원 ID를 전달하기
        userId: uuidv4(),
      },
      async (data: { rtpCapabilities: RtpCapabilities }) => {
        console.log(`Router RTP Capabilities... ${data.rtpCapabilities}`);

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
        await this._addConsumeTransport(producerId, userId, device);
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
      const consumerTransport = this._consumerTransports.find(
        (transportData) => transportData.producerId === remoteProducerId
      );
      if (consumerTransport === undefined) {
        return;
      }
      consumerTransport.consumer.close();
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
    this._audioProducer = await sendTransport.produce({
      track: localMediaStream.getAudioTracks()[0],
    });
    this._videoProducer = await sendTransport.produce({
      track: localMediaStream.getVideoTracks()[0],
    });

    this._audioProducer.on("trackended", () => {
      console.log("audio track ended");
      // TODO: close audio track
    });
    this._audioProducer.on("transportclose", () => {
      console.log("audio transport ended");
      // close audio track
    });

    this._videoProducer.on("trackended", () => {
      console.log("video track ended");
      // TODO: close video track
    });
    this._videoProducer.on("transportclose", () => {
      console.log("video transport ended");
      // TODO: close video track
    });
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
          if (producersExist) this._getProducersAndConsume(device);
        }
      );
    } catch (error: any) {
      errback(error);
    }
  };

  private _getProducersAndConsume = (device: Device) => {
    this._requireSocket().emit(
      GET_PRODUCER_IDS,
      (userProducerIds: { producerId: string; userId: string }[]) => {
        console.log(userProducerIds);
        // for each of the producer create a consumer
        // producerIds.forEach(id => signalNewConsumerTransport(id))
        userProducerIds.forEach(async (userProducerIdSet) => {
          await this._addConsumeTransport(
            userProducerIdSet.producerId,
            userProducerIdSet.userId,
            device
          );
        });
      }
    );
  };

  private _addConsumeTransport = async (
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

        let consumerTransport: Transport;
        try {
          consumerTransport = device.createRecvTransport(params);
        } catch (error) {
          // exceptions:
          // {InvalidStateError} if not loaded
          // {TypeError} if wrong arguments.
          console.log(error);
          return;
        }

        consumerTransport.on(
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
                serverConsumerTransportId: params.id,
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
          consumerTransport,
          remoteProducerId,
          params.id,
          userId,
          device
        );
      }
    );
  };

  private _connectRecvTransport = async (
    consumerTransport: Transport,
    remoteProducerId: string,
    serverConsumerTransportId: string,
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
        serverConsumerTransportId,
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
        const consumer = await consumerTransport.consume(params);
        this._consumerTransports = [
          ...this._consumerTransports,
          {
            userId,
            consumerTransport,
            serverConsumerTransportId: params.id,
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

  public produceTrack = async (track: MediaStreamTrack) => {
    if (this._sendTransport == null) {
      throw new InvalidStateError(
        "_sendTransport가 존재하지 않아 produceTrack를 생성할 수 없습니다."
      );
    }
    this._videoProducer = await this._sendTransport.produce({ track });
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
}
