import { NextPage } from "next";
import { observer } from "mobx-react";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import pagenationStyles from "@/styles/pagenation.module.scss";

export const PagenationBar: NextPage<{ numPerPage: number }> = observer(
  ({ numPerPage }) => {
    const [page, setPage] = useState<number>(1);
    const [previousPage, setPreviousPage] = useState<number | undefined>(
      undefined
    );
    const firstpage = page - (page % 10);
    const pageArray: number[] = [];
    for (
      var i = firstpage === 0 ? 1 : firstpage;
      i <= numPerPage && i < firstpage + 10;
      i++
    ) {
      pageArray.push(i);
    }
    useEffect(() => {
      console.log(previousPage);
      console.log(page);
      if (page === 1) {
        // document.getElementById("previous")!.style.color = var(--system_ui-01)};
      }
      // document.getElementById(
      //   page.toString()
      // )!.className += `${pagenationStyles["selected-color"]}`;
    }, [page]);

    const pageOnClick = (value: string) => {
      setPreviousPage(page);
      if (value === "next") {
        setPage(page + 1);
      } else if (value === "previous") {
        setPage(page - 1);
      } else if (Number.isInteger(parseInt(value))) {
        setPage(parseInt(value));
      }
    };

    return (
      <div>
        <div>
          <span
            id={"previous"}
            className={`${pagenationStyles["next-icon"]} material-symbols-outlined`}
            onClick={() => pageOnClick("previous")}
          >
            arrow_back_ios_new
          </span>
          <p
            id={"previous"}
            className={"previous-button page-button typography__text--big"}
            onClick={() => pageOnClick("previous")}
          >
            이전
          </p>
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
                className={`${pagenationStyles["selected-color"]} page-button typography__text--big`}
                onClick={(e) => {
                  pageOnClick(num.toString());
                }}
              >
                {num}
              </p>
            ))}
          </div>
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
        <style jsx>
          {`
            .page-button {
              display: inline;
              cursor: pointer;
              font-weight: 400;
              margin-right: 20px;
              height: 28px;
              line-height: 28px;
              color: #c1c1c1;
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
