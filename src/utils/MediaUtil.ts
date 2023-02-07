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

  public getMediaStreamUsingFirstVideoTrackOf = (mediaStream: MediaStream) => {
    return new MediaStream([mediaStream.getVideoTracks()[0]]);
  };

  public getMediaStreamUsingFirstAudioTrackOf = (mediaStream: MediaStream) => {
    return new MediaStream([mediaStream.getAudioTracks()[0]]);
  };
}
