import { NextPage } from "next";
import createRoomStyles from "@/styles/createRoomDialog.module.scss";
import React, { SetStateAction, useEffect, useRef, useState } from "react";
import { observer } from "mobx-react";
import { useStores } from "@/stores/context";
import Image from "next/image";
import { CREATE_ROOM_TAG_INPUT_PLACE_HOLDER } from "@/constants/message";
interface ClickableComponentProps {
  onClick: () => void;
}
export const CreateRoomDialogContainer: NextPage<ClickableComponentProps> = ({
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`${createRoomStyles["create-room__background"]}`}
    ></div>
  );
};

const CreateRoomTitle: NextPage = observer(() => {
  return (
    <>
      <div className={`${createRoomStyles["create-room__title"]}`}>
        <span
          className={`${createRoomStyles["create-room__title__icon"]} material-symbols-outlined`}
        >
          add_box
        </span>
        <label
          className={`${createRoomStyles["create-room__title__label"]} typography__text--big`}
        >
          스터디 룸 개설
        </label>
      </div>
      <style jsx>
        {`
          .material-symbols-outlined {
            font-variation-settings: "FILL" 1, "wght" 400, "GRAD" 0, "opsz" 48;
          }
        `}
      </style>
    </>
  );
});

const CreateRoomInfo: NextPage = observer(() => {
  const { roomListStore } = useStores();
  const [typedTag, setTypedTag] = useState<string>("");
  const [pictureHover, setPictureHover] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const cancelButton = document.getElementById(
      "picture-cancel-button"
    ) as HTMLButtonElement;
    if (!cancelButton) return;
    if (pictureHover) {
      cancelButton.style.display = "flex";
    } else {
      cancelButton.style.display = "none";
    }
  }, [pictureHover]);

  useEffect(() => {
    const tagsLength = roomListStore.tempRoom.tags.length;
    const tagDiv = document.getElementById("create-tags") as HTMLDivElement;
    const tagInput = document.getElementById(
      "create-tags-input"
    ) as HTMLInputElement;
    const length = tagDiv.clientWidth + 4 * tagsLength - 10;
    tagInput.style.marginLeft = length.toString() + "px";
    tagInput.style.width = (316 - length).toString() + "px";
    tagInput.placeholder =
      tagsLength === 0 ? CREATE_ROOM_TAG_INPUT_PLACE_HOLDER : "";
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [roomListStore.tempRoom.tags]);

  const tagDeleted = (tag: string) => {
    const tagInput = document.getElementById(
      "create-tags-input"
    ) as HTMLInputElement;
    const tagDiv = document.getElementById(`tagDiv-${tag}`) as HTMLDivElement;
    tagInput.style.width =
      (
        tagInput.clientWidth +
        tagDiv.clientWidth +
        4 * tagDiv.clientWidth -
        10
      ).toString() + "px";
  };

  const tagInputOnKeyDown = async (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    let key = e.key || e.keyCode;
    if (key === "Enter" || key === 13) {
      e.preventDefault();
      if (typedTag !== "") {
        if (roomListStore.tempRoom.tags.length >= 3) {
          setTypedTag("");
          (e.target as HTMLInputElement).value = "";
          return;
        }
        roomListStore.addTypedTag("# " + typedTag);
        setTypedTag("");
        (e.target as HTMLInputElement).value = "";
      }
    }
  };

  return (
    <>
      <div className={`${createRoomStyles["create-room__info-form"]}`}>
        <div
          className={`${createRoomStyles["create-room__profile-image-form"]}`}
        >
          {roomListStore.imageUrl ? (
            <div style={{ position: "relative" }}>
              <Image
                className={`${createRoomStyles["create-room__profile-image-form__image"]}`}
                alt={"thumbnail"}
                src={roomListStore.imageUrl}
                width={120}
                height={120}
                onMouseEnter={() => {
                  setPictureHover(true);
                }}
                onMouseLeave={() => {
                  setPictureHover(false);
                }}
              ></Image>
              <button
                id={"picture-cancel-button"}
                className={`${createRoomStyles["create-room__profile-image-form__cancel-button"]} elevation__snack-bar__FAB--waiting`}
                onMouseEnter={() => {
                  setPictureHover(true);
                }}
                onMouseLeave={() => {
                  setPictureHover(false);
                }}
                onClick={() => {
                  if (
                    confirm(
                      `썸네일 이미지를 삭제하고 기본 이미지로 변경하시겠어요?`
                    ) === true
                  ) {
                    roomListStore.initImageUrl();
                  }
                }}
              >
                <span className="material-symbols-rounded">close</span>
              </button>
            </div>
          ) : (
            <div
              className={`${createRoomStyles["create-room__profile-image-form__image--empty"]}`}
            >
              <span className="material-symbols-outlined">help</span>
              <div className={`${createRoomStyles["background"]}`}></div>
            </div>
          )}
          <input
            id="roomThumbnail"
            type="file"
            accept="image/png, image/jpeg"
            onChange={(e) => {
              if (e.target.files) {
                roomListStore.importRoomThumbnail(e.target.files[0]);
              }
            }}
            hidden
          />
          <button
            className={`${createRoomStyles["create-room__profile-image-form__button"]}`}
            onClick={() => {
              document.getElementById("roomThumbnail")!.click();
            }}
          >
            <span
              className={`${createRoomStyles["create-room__profile-image-form__button__icon"]} material-symbols-outlined`}
            >
              image
            </span>
            <label
              className={`${createRoomStyles["create-room__profile-image-form__button__label"]} typography__text`}
            >
              썸네일 업로드하기
            </label>
          </button>
        </div>
        <div className={`${createRoomStyles["create-room__profile-form"]}`}>
          <div
            className={`${createRoomStyles["create-room__profile-form__title"]}`}
          >
            <label
              className={`${createRoomStyles["create-room__profile-form__title__label"]} typography__caption`}
            >
              스터디 룸 제목
            </label>
            <input
              id={"create-title"}
              className={`${createRoomStyles["create-room__profile-form__title__input"]} typography__text--small`}
              type={"text"}
              placeholder={"스터디 룸 제목을 입력해주세요"}
              maxLength={20}
              onChange={(e) => {
                roomListStore.setRoomTitleInput(
                  (e.target as HTMLInputElement).value
                );
              }}
              autoComplete="off"
            />
            <label
              className={`${createRoomStyles["create-room__profile-form__title__notice"]} typography__caption`}
            >
              필수 입력 항목입니다
            </label>
          </div>
          <div
            className={`${createRoomStyles["create-room__profile-form__tag"]}`}
          >
            <label
              className={`${createRoomStyles["create-room__profile-form__tag__label"]} typography__caption`}
            >
              스터디 룸 태그
            </label>
            <div
              id={"tag-form"}
              className={`${createRoomStyles["create-room__profile-form__tag__input-form"]} typography__text--small`}
            >
              <div
                id={"create-tags"}
                className={`${createRoomStyles["create-room__profile-form__tag__selected-tags"]}`}
              >
                {roomListStore.tempRoom.tags.map((tag) => (
                  <div
                    key={tag}
                    id={`tagDiv-${tag}`}
                    className={`${createRoomStyles["create-room__profile-form__tag__selected-tag"]} typography__text--small elevation__top-app-bar--rise`}
                  >
                    <label>{tag}</label>
                    <span
                      className="material-symbols-outlined"
                      onClick={() => {
                        roomListStore.removeTypedTag(tag);
                        tagDeleted(tag);
                      }}
                    >
                      close
                    </span>
                  </div>
                ))}
              </div>
              <input
                id={"create-tags-input"}
                className={"typography__text--small"}
                ref={inputRef}
                type={"text"}
                placeholder={CREATE_ROOM_TAG_INPUT_PLACE_HOLDER}
                onChange={(e) => {
                  setTypedTag((e.target as HTMLInputElement).value);
                }}
                onKeyDown={tagInputOnKeyDown}
                disabled={roomListStore.tempRoom.tags.length >= 3}
              />
            </div>
            <label
              className={`${createRoomStyles["create-room__profile-form__tag__notice"]} typography__caption`}
            >
              필수 입력 항목이며 최대 3개의 태그를 설정할 수 있습니다
            </label>
          </div>
        </div>
      </div>
      <style jsx>
        {`
          .material-symbols-outlined {
            font-variation-settings: "FILL" 1, "wght" 700, "GRAD" -25, "opsz" 20;
          }
        `}
      </style>
    </>
  );
});

const CreateRoomSetting: NextPage = observer(() => {
  const { roomListStore } = useStores();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [dialogText, setDialogText] = useState<string>("");
  useEffect(() => {
    const passwordForm = document.getElementById(
      "password-form"
    ) as HTMLElement;
    roomListStore.isRoomPrivate
      ? (passwordForm.style.display = "flex")
      : (passwordForm.style.display = "none");
  }, [roomListStore.isRoomPrivate]);

  useEffect(() => {
    if (showPassword) {
      (document.getElementById("password-input") as HTMLInputElement).type =
        "text";
    } else {
      (document.getElementById("password-input") as HTMLInputElement).type =
        "password";
    }
  }, [showPassword]);

  return (
    <>
      <div className={`${createRoomStyles["create-room__setting-form"]}`}>
        <div className={`${createRoomStyles["create-room__private-form"]}`}>
          <div
            className={`${createRoomStyles["create-room__private-form__label-form"]}`}
          >
            <label
              className={`${createRoomStyles["create-room__private-form__label-form__title"]} typography__text`}
            >
              스터디 룸 비공개
            </label>
            <label
              className={`${createRoomStyles["create-room__private-form__label-form__notice"]} typography__caption`}
            >
              비밀번호를 입력해야만 입장이 가능합니다
            </label>
          </div>
          <div
            className={`${
              createRoomStyles[
                `create-room__private-form__button${
                  roomListStore.isRoomPrivate ? "--on" : ""
                }`
              ]
            }`}
            onClick={() => {
              roomListStore.toggleIsRoomPrivate();
            }}
          >
            <div
              className={`${createRoomStyles["create-room__private-form__button__circle"]}`}
            ></div>
          </div>
        </div>
        <div
          id={"password-form"}
          className={`${createRoomStyles["create-room__password-form"]}`}
        >
          <label
            className={`${createRoomStyles["create-room__password-form__title"]} typography__caption`}
          >
            스터디 룸 비밀번호
          </label>
          <input
            id={"password-input"}
            className={`${createRoomStyles["create-room__password-form__input"]} typography__text--small`}
            type={"password"}
            placeholder={"스터디룸 비밀번호를 입력해주세요"}
            autoComplete={"off"}
          />
          <span
            className={`${createRoomStyles["create-room__password-form__visible-button"]} material-symbols-outlined`}
            onClick={(e) => {
              setShowPassword(!showPassword);
            }}
          >
            {showPassword ? "visibility" : "visibility_off"}
          </span>
          <label
            className={`${createRoomStyles["create-room__password-form__notice"]} typography__caption`}
          >
            비공개 방으로 설정한 경우 필수 항목입니다
          </label>
        </div>
      </div>
      <style jsx>
        {`
          .material-symbols-outlined {
            font-variation-settings: "FILL" 1, "wght" 400, "GRAD" 0, "opsz" 48;
          }
        `}
      </style>
    </>
  );
});

const CreateRoomButton: NextPage = observer(() => {
  const { roomListStore } = useStores();
  return (
    <>
      <div className={`${createRoomStyles["create-room__button-form"]}`}>
        <button
          className={`${createRoomStyles["create-room__button-form__cancel-button"]}`}
        >
          <label
            className={`${createRoomStyles["create-room__button-form__cancel-button__label"]}`}
          >
            취소
          </label>
        </button>
        <button
          className={`${createRoomStyles["create-room__button-form__create-button"]}`}
          disabled={!roomListStore.isCreateButtonEnable}
        >
          <label
            className={`${createRoomStyles["create-room__button-form__create-button__label"]}`}
          >
            스터디 룸 만들기
          </label>
        </button>
      </div>
    </>
  );
});

export const CreateRoomDialog: NextPage = observer(() => {
  return (
    <>
      <div
        className={`${createRoomStyles["create-room-form"]} elevation__modal__popup__etc--dialog`}
      >
        <CreateRoomTitle />
        <CreateRoomInfo />
        <CreateRoomSetting />
        <CreateRoomButton />
      </div>
      <style jsx>
        {`
          .material-symbols-outlined {
            font-variation-settings: "FILL" 1, "wght" 400, "GRAD" 0, "opsz" 48;
          }
        `}
      </style>
    </>
  );
});
