// TODO: 실제 이미지 서버의 도메인으로 변경하기, 상수 파일로 옮기기
const IMAGE_SERVER_DOMAIN = "todo";

// TODO: camstudy-webrtc-server와 중복되는 인테페이스임. 하나로 관리할 방법을 찾아야함
export interface ChatMessage {
  readonly id: string;
  readonly authorId: string;
  readonly authorName: string;
  readonly content: string;
  /** ISO time string format */
  readonly sentAt: string;
}

export const getUserProfileImageUrl = (userId: string): string => {
  return `https://${IMAGE_SERVER_DOMAIN}/users/${userId}`;
};

// https://serverdomain/users/[uid]
