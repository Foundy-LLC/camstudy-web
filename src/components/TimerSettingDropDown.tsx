import { NextPage } from "next";
import { observer } from "mobx-react";
import dropDownStyles from "@/styles/timerSettingDropDown.module.scss";
import React, { useState } from "react";

export const TimerSettingDropDown: NextPage<{
  items: string[];
  initIndex: number;
}> = observer(({ items, initIndex }) => {
  const [focused, setFocused] = useState<boolean>(false);
  const [selected, setSelected] = useState<string>(items[initIndex]);
  return (
    <>
      <div
        className={`${dropDownStyles["drop-down-form"]}`}
        tabIndex={0}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      >
        <div
          className={`${dropDownStyles["drop-down-form__selected"]} typography__text`}
          onClick={() => (focused ? setFocused(true) : setFocused(!focused))}
        >
          <label>{selected}</label>
          <span className="material-symbols-rounded">expand_more</span>
        </div>
        <ul
          className={`${dropDownStyles["drop-down-form__ul"]} typography__text`}
          hidden={!focused}
        >
          {items.map((item) =>
            item === selected ? (
              <li
                className={`${dropDownStyles["drop-down-form__li--selected"]}`}
                onClick={() => setFocused(!focused)}
              >
                <label>{item}</label>
              </li>
            ) : (
              <li
                className={`${dropDownStyles["drop-down-form__li"]}`}
                onClick={() => {
                  setFocused(!focused);
                  setSelected(item);
                }}
              >
                <label>{item}</label>
              </li>
            )
          )}
        </ul>
      </div>
    </>
  );
});
