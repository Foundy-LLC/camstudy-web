import { MAX_REPORT_CONTENT_LENGTH } from "@/constants/report.constant";

export const SERVER_INTERNAL_ERROR_MESSAGE: string =
  "서버 내부에 에러가 발생했습니다.";
export const REQUEST_QUERY_ERROR = "query 요청이 잘못되었습니다";
export const PROFILE_CREATE_SUCCESS = "프로필이 생성되었습니다.";
export const PROFILE_IMAGE_UPDATE: string = "프로필 이미지가 설정되었습니다.";
export const PROFILE_IMAGE_SIZE_ERROR_MESSAGE: string =
  "파일 사이즈가이 너무 큽니다. 파일 사이즈는 최대 5MB 입니다.";
export const NO_USER_UID_ERROR_MESSAGE: string = "UID가 누락되었습니다.";
export const USER_INFORMATION_LOOKUP_SUCCESS: string =
  "현재 회원 정보 조회를 성공했습니다.";
export const NOT_FOUND_USER_MESSAGE: string = "해당 회원을 찾을 수 없습니다.";
export const PROFILE_IMAGE_INVALID_EXTENSION: string =
  "이미지는 .jpg, .jpeg, .png 만 가능합니다.";
export const NO_USER_NAME_ERROR_MESSAGE: string =
  "이름이 없습니다. 이름은 필수 항목입니다.";
export const USER_NAME_LENGTH_ERROR_MESSAGE: string =
  "이름의 길이는 1~20자 사이로 해야합니다.";
export const USER_INTRODUCE_LENGTH_ERROR_MESSAGE: string =
  "자기소개는 최대 100자입니다.";
export const TAG_COUNT_ERROR_MESSAGE: string = "태그는 최대 3개입니다.";
export const TAG_LENGTH_ERROR_MESSAGE: string = "태그는 최대 20자입니다.";
export const NO_TAG_ERROR_MESSAGE: string =
  "태그가 없습니다. 태그는 필수 항목입니다.";

export const NO_ROOM_ERROR_MESSAGE = "해당 방이 존재하지 않습니다.";
export const ROOM_PASSWORD_NOT_CORRECT_ERROR_MESSAGE =
  "방 비밀번호가 틀렸습니다.";
export const ROOM_IS_FULL_ERROR_MESSAGE = "방 정원이 꽉 찼습니다.";
export const INVALID_ROOM_PASSWORD_ERROR_MESSAGE = "방 비밀번호가 틀렸습니다.";
export const ROOM_AVAILABLE_MESSAGE = "공부방 입장이 가능합니다.";
export const NO_EXISTS_INITIAL_INFORMATION_MESSAGE: string =
  "초기 입력 정보가 없습니다.";
export const EXISTS_INITIAL_INFORMATION_MESSAGE: string =
  "초기 입력 정보가 있습니다.";

export const EXCEED_REPORT_CONTENT_LENGTH_MESSAGE: string = `신고 내용은 최대 ${MAX_REPORT_CONTENT_LENGTH}자 입니다.`;
export const NOT_FOUND_REPORTER_MESSAGE: string =
  "신고자 회원을 찾을 수 없습니다.";
export const NOT_FOUND_SUSPECT_MESSAGE: string =
  "신고할 회원을 찾을 수 없습니다.";
export const SUCCESSFUL_REPORTED_MESSAGE: string =
  "성공적으로 신고가 접수되었습니다.";
