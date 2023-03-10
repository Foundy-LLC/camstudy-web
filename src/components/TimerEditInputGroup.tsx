import { NextPage } from "next";
import { PomodoroTimerProperty } from "@/models/room/PomodoroTimerProperty";
import { useState } from "react";
import {
  validateLongBreak,
  validateLongInterval,
  validateShortBreak,
  validateTimerLength,
} from "@/utils/room.validator";
import { makeAutoObservable } from "mobx";
import { observer } from "mobx-react";

export class TimerEditInputGroupStore {
  private _timerLengthError?: string = undefined;
  private _shortBreakError?: string = undefined;
  private _longBreakError?: string = undefined;
  private _longIntervalError?: string = undefined;

  constructor(private _timerPropertyInput: PomodoroTimerProperty) {
    makeAutoObservable(this);
  }

  public get timerPropertyInput(): PomodoroTimerProperty {
    return this._timerPropertyInput;
  }

  public get timerLengthError(): string | undefined {
    return this._timerLengthError;
  }

  public get shortBreakError(): string | undefined {
    return this._shortBreakError;
  }

  public get longBreakError(): string | undefined {
    return this._longBreakError;
  }

  public get longIntervalError(): string | undefined {
    return this._longIntervalError;
  }

  public get enableSaveButton(): boolean {
    return (
      this._timerLengthError === undefined &&
      this._shortBreakError === undefined &&
      this._longBreakError === undefined &&
      this._longIntervalError === undefined
    );
  }

  private _parseIntFrom = (input: string) => {
    if (input.length === 0) {
      return 0;
    }
    return parseInt(input);
  };

  public onChangeTimerLengthInput = (input: string) => {
    try {
      const length = this._parseIntFrom(input);
      this._timerPropertyInput = {
        ...this._timerPropertyInput,
        timerLengthMinutes: length,
      };
      validateTimerLength(this._timerPropertyInput.timerLengthMinutes);
      this._timerLengthError = undefined;
    } catch (e) {
      if (typeof e === "string") {
        this._timerLengthError = e;
      }
    }
  };

  public onChangeShortBreakInput = (input: string) => {
    try {
      const length = this._parseIntFrom(input);
      this._timerPropertyInput = {
        ...this._timerPropertyInput,
        shortBreakMinutes: length,
      };
      validateShortBreak(this._timerPropertyInput.shortBreakMinutes);
      this._shortBreakError = undefined;
    } catch (e) {
      if (typeof e === "string") {
        this._shortBreakError = e;
      }
    }
  };

  public onChangeLongBreakInput = (input: string) => {
    try {
      const length = this._parseIntFrom(input);
      console.log(this._timerPropertyInput);
      this._timerPropertyInput = {
        ...this._timerPropertyInput,
        longBreakMinutes: length,
      };
      validateLongBreak(this._timerPropertyInput.longBreakMinutes);
      this._longBreakError = undefined;
    } catch (e) {
      if (typeof e === "string") {
        this._longBreakError = e;
      }
    }
  };

  public onChangeLongBreakIntervalInput = (input: string) => {
    try {
      const interval = this._parseIntFrom(input);
      this._timerPropertyInput = {
        ...this._timerPropertyInput,
        longBreakInterval: interval,
      };
      validateLongInterval(this._timerPropertyInput.longBreakInterval);
      this._longIntervalError = undefined;
    } catch (e) {
      if (typeof e === "string") {
        this._longIntervalError = e;
      }
    }
  };
}

export const TimerEditInputGroup: NextPage<{
  defaultTimerProperty: PomodoroTimerProperty;
  onClickSave: (property: PomodoroTimerProperty) => void;
}> = observer(({ defaultTimerProperty, onClickSave }) => {
  const [store] = useState(new TimerEditInputGroupStore(defaultTimerProperty));
  const propertyInput = store.timerPropertyInput;

  return (
    <>
      <div>
        ?????? ????????? ??????
        <div>????????? ?????? {defaultTimerProperty.timerLengthMinutes}???</div>
        <div>?????? ?????? ?????? {defaultTimerProperty.shortBreakMinutes}???</div>
        <div>??? ?????? ?????? {defaultTimerProperty.longBreakMinutes}???</div>
        <div>
          ??? ?????? ?????? {defaultTimerProperty.longBreakInterval}?????? ????????????
        </div>
      </div>
      <br />
      <div>
        <div>
          ????????? ??????
          <input
            value={propertyInput.timerLengthMinutes}
            onChange={(e) => store.onChangeTimerLengthInput(e.target.value)}
          />
          ???
        </div>
        <div>{store.timerLengthError}</div>
        <div>
          ?????? ?????? ??????
          <input
            value={propertyInput.shortBreakMinutes}
            onChange={(e) => store.onChangeShortBreakInput(e.target.value)}
          />
          ???
        </div>
        <div>{store.shortBreakError}</div>
        <div>
          ??? ?????? ??????
          <input
            value={propertyInput.longBreakMinutes}
            onChange={(e) => store.onChangeLongBreakInput(e.target.value)}
          />
          ???
        </div>
        <div>{store.longBreakError}</div>
        <div>
          ??? ?????? ??????
          <input
            value={propertyInput.longBreakInterval}
            onChange={(e) =>
              store.onChangeLongBreakIntervalInput(e.target.value)
            }
          />
          ?????? ????????????
        </div>
        <div>{store.longIntervalError}</div>
      </div>
      <button
        onClick={() => onClickSave(store.timerPropertyInput)}
        disabled={!store.enableSaveButton}
      >
        ???????????? ??????
      </button>
    </>
  );
});
