import {
  PAGINATION_PAGE_NULL_ERROR,
  PAGINATION_PAGE_NUM_NULL_ERROR,
} from "@/constants/common";

export const validatePaginationPage = (page: string) => {
  if (page === "") {
    throw PAGINATION_PAGE_NULL_ERROR;
  }
};

export const validatePaginationPageNum = (pageNum: number | null) => {
  if (pageNum === null) {
    throw PAGINATION_PAGE_NUM_NULL_ERROR;
  }
};

export const convertPageToInt = (page: string): number => {
  return parseInt(page);
};
