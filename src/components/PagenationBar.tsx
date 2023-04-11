import { NextPage } from "next";
import { observer } from "mobx-react";
import React, { useEffect, useState } from "react";
import pagenationStyles from "@/styles/pagenation.module.scss";
import { max } from "@popperjs/core/lib/utils/math";

export const PagenationBar: NextPage<{ maxPage: number }> = observer(
  ({ maxPage }) => {
    const [page, setPage] = useState<number>(1);
    const [previousPage, setPreviousPage] = useState<number | undefined>(
      undefined
    );
    const firstpage = page - (page % 10);
    const pageArray: number[] = [];
    for (
      var i = firstpage === 0 ? 1 : firstpage;
      i <= maxPage && i < firstpage + 10;
      i++
    ) {
      pageArray.push(i);
    }

    useEffect(() => {
      updateColor("previous", page !== 1);
      updateColor("next", maxPage > page);
      updateColor(page.toString(), true);
    }, [page]);

    useEffect(() => {
      if (previousPage === undefined) return;
      updateColor(previousPage.toString(), false);
    }, [previousPage]);

    /**
     *
     * @param id 색을 변경하고 싶은 태그의 id
     * @param when 해당 조건이 만족될 때 해당 태그 classList에 selected-color를 추가함
     */
    function updateColor(id: string, when: boolean) {
      const element = document.getElementById(id);
      if (!element) return;
      if (when) {
        element.classList.remove(`${pagenationStyles["unselected-color"]}`);
        element.classList.add(`${pagenationStyles["selected-color"]}`);
      } else {
        element.classList.remove(`${pagenationStyles["selected-color"]}`);
        element.classList.add(`${pagenationStyles["unselected-color"]}`);
      }
    }

    function pageOnClick(value: string) {
      setPreviousPage(page);
      if (value === "next") {
        setPage(page + 1);
      } else if (value === "previous") {
        setPage(page - 1);
      } else if (Number.isInteger(parseInt(value))) {
        setPage(parseInt(value));
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
              className={"previous-button page-button typography__text--big"}
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
            {pageArray.map((num) => (
              <p
                id={num.toString()}
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
              className={" next-button typography__text--big"}
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
  }
);
