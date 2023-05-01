import { NextPage } from "next";
import { observer } from "mobx-react";
import React, { useEffect, useState } from "react";
import pagenationStyles from "@/styles/pagenation.module.scss";

/**
 * @param maxPage 마지막 페이지 값
 * @param update 페이지 클릭 시 업데이트 함수
 */
export const PagenationBar: NextPage<{
  maxPage: number;
  update: (page: number) => void;
}> = observer(({ maxPage, update }) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [previousPage, setPreviousPage] = useState<number | undefined>(
    undefined
  );
  const firstpage = currentPage - (currentPage % 10);
  const pageArray: number[] = [];
  for (
    var i = firstpage === 0 ? 1 : firstpage;
    i <= maxPage && i < firstpage + 10;
    i++
  ) {
    pageArray.push(i);
  }

  useEffect(() => {
    updateElement("previous", currentPage !== 1);
    updateElement("next", maxPage > currentPage);
    updateElement(currentPage.toString(), true);
    update(currentPage);
  }, [currentPage]);

  useEffect(() => {
    if (previousPage === undefined) return;
    updateElement(previousPage.toString(), false);
  }, [previousPage]);

  /**
   *
   * @param id 색을 변경하고 싶은 태그의 id
   * @param when 해당 조건이 만족될 때 해당 태그 classList에 selected-color를 추가함
   */
  function updateElement(id: string, when: boolean) {
    const element = document.getElementById(id);
    if (!element) return;

    if (id === "next" || id === "previous")
      when
        ? (element.style.pointerEvents = "auto")
        : (element.style.pointerEvents = "none");

    if (when) {
      element.classList.add(`${pagenationStyles["selected-color"]}`);
      element.classList.remove(`${pagenationStyles["unselected-color"]}`);
    } else {
      element.classList.add(`${pagenationStyles["unselected-color"]}`);
      element.classList.remove(`${pagenationStyles["selected-color"]}`);
    }
  }

  function pageOnClick(value: string) {
    setPreviousPage(currentPage);
    if (value === "next") {
      setCurrentPage(currentPage + 1);
    } else if (value === "previous") {
      setCurrentPage(currentPage - 1);
    } else if (Number.isInteger(parseInt(value))) {
      setCurrentPage(parseInt(value));
    }
  }

  return (
    <div>
      <div>
        <div id="previous">
          <span
            className={`${pagenationStyles["next-icon"]} material-symbols-outlined`}
            onClick={() => pageOnClick("previous")}
          >
            arrow_back_ios_new
          </span>
          <p
            className={
              "previous-button currentPage-button typography__text--big"
            }
            onClick={() => pageOnClick("previous")}
          >
            이전
          </p>
        </div>
        <div
          style={{
            width: "270px",
            height: "28px",
            display: "inline",
            marginRight: "8px",
          }}
        >
          {pageArray.map((num, key) => (
            <p
              id={num.toString()}
              key={key}
              className={`${pagenationStyles["unselected-color"]} page-button typography__text--big`}
              onClick={(e) => {
                pageOnClick(num.toString());
              }}
            >
              {num}
            </p>
          ))}
        </div>
        <div id="next">
          <p
            className={"next-button typography__text--big"}
            onClick={() => pageOnClick("next")}
          >
            다음
          </p>
          <span
            className={`${pagenationStyles["next-icon"]} material-symbols-outlined`}
            style={{ cursor: "pointer", height: "20px", width: "11.77px" }}
            onClick={() => pageOnClick("next")}
          >
            arrow_forward_ios
          </span>
        </div>
      </div>
      <style jsx>
        {`
          #previous {
            display: inline;
          }
          #next {
            display: inline;
          }
          .page-button {
            display: inline;
            cursor: pointer;
            font-weight: 400;
            margin-right: 20px;
            height: 28px;
            line-height: 28px;
          }

          .previous-button {
            display: inline;
            cursor: pointer;
            font-weight: 400;
            line-height: 28px;
            margin-right: 28px;
            margin-left: 8.22px;
          }

          .next-button {
            display: inline;
            cursor: pointer;
            font-weight: 400;
            line-height: 28px;
            margin-right: 8.22px;
          }
          .material-symbols-outlined {
            font-variation-settings: "FILL" 0, "wght" 600, "GRAD" 0, "opsz" 48;
            font-size: 20px;
          }
        `}
      </style>
    </div>
  );
});
