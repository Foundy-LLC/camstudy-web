import { POMODORO_LONG_INTERVAL_RANGE } from "@/constants/room.constant";
import { ROOM_PAGE_NUM_NULL_ERROR } from "@/constants/roomMessage";
import { ORGANIZATIONS_PAGE_NUM_NULL_ERROR } from "@/constants/organizationMessage";

export const validateOrganizationName = (organizationName: string) => {
  if (!organizationName) {
    throw `긴 휴식 주기는 ${POMODORO_LONG_INTERVAL_RANGE}회 사이만 가능합니다.`;
  }
};

export const validateOrganizationsPageNum = (pageNum: number | null) => {
  if (pageNum === null) {
    throw ORGANIZATIONS_PAGE_NUM_NULL_ERROR;
  }
};
