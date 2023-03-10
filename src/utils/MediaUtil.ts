const MEDIA_CONSTRAINTS = {
  audio: true,
  video: {
    width: {
      min: 640,
      max: 1920,
    },
    height: {
      min: 400,
      max: 1080,
    },
  },
};

export class MediaUtil {
  public fetchLocalMedia = async ({
    video = false,
    audio = false,
  }): Promise<MediaStream> => {
    return await navigator.mediaDevices.getUserMedia({
      ...MEDIA_CONSTRAINTS,
      video: video,
      audio: audio,
    });
  };

  public fetchLocalVideo = async (
    videoDeviceId: string
  ): Promise<MediaStream> => {
    return await navigator.mediaDevices.getUserMedia({
      video: { deviceId: videoDeviceId },
    });
  };

  public fetchLocalAudioInput = async (
    audioDeviceId: string
  ): Promise<MediaStream> => {
    return await navigator.mediaDevices.getUserMedia({
      audio: { deviceId: audioDeviceId },
    });
  };

  public getMediaStreamUsingFirstVideoTrackOf = (mediaStream: MediaStream) => {
    // TODO(민성): 배열 인덱스 범위 에러 발생할 수 있기 때문에 미디어가 없는 기기에서 테스트 필요함
    return new MediaStream([mediaStream.getVideoTracks()[0]]);
  };

  public getMediaStreamUsingFirstAudioTrackOf = (mediaStream: MediaStream) => {
    // TODO(민성): 배열 인덱스 범위 에러 발생할 수 있기 때문에 미디어가 없는 기기에서 테스트 필요함
    return new MediaStream([mediaStream.getAudioTracks()[0]]);
  };
}
