import { RoomObserver } from "@/stores/RoomStore";
import { io, Socket } from "socket.io-client";
import {
  CONNECTION_SUCCESS,
  CREATE_WEB_RTC_TRANSPORT,
  JOIN_ROOM,
  NAME_SPACE,
  TRANSPORT_PRODUCER,
  TRANSPORT_PRODUCER_CONNECT,
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
} from "mediasoup-client/lib/Transport";

const PORT = 2000;
const SOCKET_SERVER_URL = `http://localhost:${PORT}${NAME_SPACE}`;

export class RoomSocketService {
  private _socket: Socket | undefined;

  constructor(private readonly _roomObserver: RoomObserver) {}

  private requireSocket(): Socket {
    if (this._socket === undefined) {
      throw Error("소켓이 초기화되지 않았습니다.");
    }
    return this._socket;
  }

  public connect = () => {
    this._socket = io(SOCKET_SERVER_URL);
    this._socket.on(
      CONNECTION_SUCCESS,
      async ({ socketId }: { socketId: string }) => {
        console.log("Connected: ", socketId);
        this._roomObserver.onConnected();
        // TODO: 바로 방에 접속하지 않고 준비 화면에서 회원이 접속 버튼을 눌러야지 접속되도록 한다. 준비 화면에서는 로컬 비디오, 음성을 확인해야한다.
        // TODO: 임시 방이름 말고 진짜 방이름으로 변경하기([roomId] 이용)
        this.join("roomName");
      }
    );
  };

  public join = (roomName: string) => {
    this.requireSocket().emit(
      JOIN_ROOM,
      {
        roomName: roomName,
        userId: "userId",
      },
      async (data: { rtpCapabilities: RtpCapabilities }) => {
        console.log(`Router RTP Capabilities... ${data.rtpCapabilities}`);

        try {
          // once we have rtpCapabilities from the Router, create Device
          const device = new Device();
          await device.load({ routerRtpCapabilities: data.rtpCapabilities });

          this.createSendTransport(device);
        } catch (e) {
          // TODO
        }
      }
    );
  };

  private createSendTransport = (device: Device) => {
    this.requireSocket().emit(
      CREATE_WEB_RTC_TRANSPORT,
      {
        isConsumer: false,
      },
      async ({
        params,
      }: {
        params: {
          id: string;
          iceParameters: IceParameters;
          iceCandidates: IceCandidate[];
          dtlsParameters: DtlsParameters;
        };
      }) => {
        console.log(params);
        // creates a new WebRTC Transport to send media
        // based on the server's producer transport params
        // https://mediasoup.org/documentation/v3/mediasoup-client/api/#TransportOptions
        const producerTransport = device.createSendTransport(params);

        // https://mediasoup.org/documentation/v3/communication-between-client-and-server/#producing-media
        // this event is raised when a first call to transport.produce() is made
        // see connectSendTransport() below
        producerTransport.on(
          "connect",
          async ({ dtlsParameters }, callback, errback) => {
            await this.onConnectedProducerTransport(
              dtlsParameters,
              callback,
              errback
            );
          }
        );

        producerTransport.on(
          "produce",
          async (parameters, callback, errback) => {
            await this.onProducedProducerTransport(
              parameters,
              callback,
              errback
            );
          }
        );

        // TODO
        //await connectSendTransport();
      }
    );
  };

  private onConnectedProducerTransport = async (
    dtlsParameters: DtlsParameters,
    callback: () => void,
    errback: (error: Error) => void
  ) => {
    try {
      // Signal local DTLS parameters to the server side transport
      // see server's socket.on('transport-producer-connect', ...)
      await this.requireSocket().emit(TRANSPORT_PRODUCER_CONNECT, {
        dtlsParameters,
      });

      // Tell the transport that parameters were transmitted.
      callback();
    } catch (error: any) {
      errback(error);
    }
  };

  private onProducedProducerTransport = async (
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
      await this.requireSocket().emit(
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
          if (producersExist) this.getProducers();
        }
      );
    } catch (error: any) {
      errback(error);
    }
  };

  private getProducers = () => {
    // TODO
  };
}
