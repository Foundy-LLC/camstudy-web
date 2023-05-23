import { NextPage } from "next";
import { observer } from "mobx-react";
import dropDownStyles from "@/styles/timerSettingDropDown.module.scss";
import React, { useState } from "react";

export const TimerSettingDropDown: NextPage<{
  items: number[];
  suffix: string;
  type: string;
  selectedValue: number;
  onSelect: (input: string) => void;
}> = observer(({ items, suffix, type, selectedValue, onSelect }) => {
  const [focused, setFocused] = useState<boolean>(false);
  const [selected, setSelected] = useState<number>(selectedValue);

  const select = (value: string) => {
    onSelect(value);
  };

  return (
    <div className={`${dropDownStyles["drop-down-form"]}`} tabIndex={0}>
      <div
        className={`${dropDownStyles["drop-down-form__selected"]} typography__text`}
        onClick={() => (focused ? setFocused(false) : setFocused(true))}
      >
        <label>{`${selected}${suffix}`}</label>
        <span className="material-symbols-rounded">expand_more</span>
      </div>
      <ul
        className={`${dropDownStyles["drop-down-form__ul"]} typography__text`}
        hidden={!focused}
      >
        {items.map((item, key) =>
          item === selected ? (
            <li
              key={key}
              className={`${dropDownStyles["drop-down-form__li--selected"]}`}
              onClick={() => setFocused(false)}
            >
              <label>{`${item}${suffix}`}</label>
            </li>
          ) : (
            <li
              key={key}
              className={`${dropDownStyles["drop-down-form__li"]}`}
              onClick={() => {
                setFocused(false);
                setSelected(item);
                select(item.toString());
              }}
            >
              <label>{`${item}${suffix}`}</label>
            </li>
          )
        )}
      </ul>
    </div>
  );
});
