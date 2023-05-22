import { NextPage } from "next";
import { observer } from "mobx-react";
import { useStores } from "@/stores/context";
import Image from "next/image";
import React, { MouseEvent, useEffect, useState } from "react";
import { DEFAULT_THUMBNAIL_URL } from "@/constants/default";
import { UserOverview } from "@/models/user/UserOverview";
import { UserStatus } from "@/models/user/UserStatus";
import friendStyles from "@/styles/friend.module.scss";
import optionIcon from "/public/room/option.png";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/service/firebase";
import { useRouter } from "next/router";
import { PagenationBar } from "@/components/PagenationBar";
import { Layout } from "@/components/Layout";
import {
  ProfileDialog,
  ProfileDialogContainer,
} from "@/components/ProfileDialog";

const FriendOverview: NextPage<{
  item: UserOverview;
  setModal: (userId: string) => void;
}> = observer(({ item, setModal }) => {
  const { friendStore } = useStores();
  const { id, name, profileImage, introduce, status } = item;
  const [isModalHidden, setIsModalHidden] = useState<boolean>(true);

  useEffect(() => {
    if (isModalHidden === true) {
      window.removeEventListener("click", windowClickHandler);
    }
  }, [isModalHidden]);
  const windowClickHandler = (e: Event) => {
    if (
      (e.target as Element).id.includes(`friend__${id}__icon`) === false &&
      (e.target as Element).id.includes(`friend__${id}__icon--etc`) === false &&
      (e.target as Element).className.includes("friend-list__option__modal") ===
        false
    ) {
      console.log("clicked");
      if (!document.getElementById(`friend__${id}__modal`)) {
        return;
      }
      document.getElementById(`friend__${id}__modal`)!.style.display = "none";
    }
  };

  const optionOnClick = (e: MouseEvent) => {
    setIsModalHidden(false);
    const modal = document.getElementById(`friend__${id}__modal`)!;
    modal.style.display = "block";
    window.addEventListener("click", windowClickHandler);
  };

  return (
    <div
      className={`${friendStyles["friend-list-form"]} elevation__card__search-bar__contained-button--waiting__etc`}
    >
      <Image
        width={50}
        height={50}
        src={profileImage ? profileImage : DEFAULT_THUMBNAIL_URL}
        alt={`${name}-profileImg`}
        className={`${friendStyles["friend-profile"]} `}
      />
      <div className={`${friendStyles["friend-info"]} typography__text`}>
        <div style={{ display: "flex", flexDirection: "row" }}>
          <label className={`${friendStyles["friend-name"]} typography__text`}>
            {name}
          </label>{" "}
          {status === UserStatus.LOGIN ? (
            <label
              className={`${friendStyles["friend-status-online"]} typography__caption`}
            >
              접속 중
            </label>
          ) : (
            <label
              className={`${friendStyles["friend-status-offline"]} typography__caption`}
            >
              로그오프
            </label>
          )}{" "}
        </div>
        <label
          className={`typography__text`}
          style={{
            color: "#838383",
          }}
        >
          {introduce}
        </label>
      </div>
      <div
        id={"friend__" + id + "__icon"}
        className={`${friendStyles["friend-option"]}`}
        onClick={(e) => {
          optionOnClick(e);
        }}
      >
        <button className={`${friendStyles["friend-option-button"]}`}>
          <span
            id={"friend__" + id + "__icon--etc"}
            onClick={(e) => {
              optionOnClick(e);
            }}
            className={`${friendStyles["friend-option-icon"]} material-symbols-sharp`}
          >
            more_horiz
          </span>
        </button>
        <div
          id={"friend__" + item.id + "__modal"}
          className={`${friendStyles["friend-list__option__modal"]} elevation__navigation-drawer__modal-side-bottom-sheet__etc`}
        >
          <ul className={`${friendStyles["friend-list__option__modal__ul"]}`}>
            <li
              className={`${friendStyles["friend-list__option__modal__li"]} typography__caption`}
              onClick={async () => {
                document.getElementById(`friend__${id}__modal`)!.style.display =
                  "none";
                if (
                  confirm(`${name}을 친구 목록에서 삭제하시겠어요?`) === true
                ) {
                  await window.removeEventListener("click", windowClickHandler);
                  await friendStore.deleteFriend(id);
                }
              }}
            >
              친구 삭제
            </li>
            <li
              className={`${friendStyles["friend-list__option__modal__li"]} typography__caption`}
              onClick={() => {
                document.getElementById(`friend__${id}__modal`)!.style.display =
                  "none";
                setModal(id);
                window.removeEventListener("click", windowClickHandler);
              }}
            >
              프로필 보기
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
});

const FriendOverviewGroup: NextPage<{
  items: UserOverview[];
  setModal: (userId: string) => void;
}> = observer(({ items, setModal }) => {
  const { friendStore } = useStores();
  return (
    <>
      <div
        className={`${friendStyles["friend-list-frame"]} elevation__card__search-bar__contained-button--waiting__etc`}
      >
        <div className={`${friendStyles["friend-list-info"]}`}>
          <span
            className={`${friendStyles["friend-list-icon"]} material-symbols-sharp`}
          >
            group
          </span>
          <label
            className={`${friendStyles["friend-list-label"]} typography__text--big`}
          >
            내 친구
          </label>
        </div>
        {!friendStore.errorMessage ? (
          <div className={`${friendStyles["friend-list-grid"]} `}>
            {items.map((item, key) => (
              <FriendOverview item={item} key={key} setModal={setModal} />
            ))}
          </div>
        ) : (
          <p
            className={`${friendStyles["friend-list__error"]} typography__text--big`}
          >
            {friendStore.errorMessage}
          </p>
        )}
        <div
          style={{
            position: "absolute",
            bottom: 46,
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          {!friendStore.errorMessage && (
            <PagenationBar
              maxPage={friendStore.friendListMaxPage}
              update={friendStore.fetchFriendList}
            />
          )}
        </div>
      </div>
      <style jsx>
        {`
          .material-symbols-sharp {
            font-variation-settings: "FILL" 1, "wght" 400, "GRAD" 0, "opsz" 48;
          }
        `}
      </style>
    </>
  );
});

const FriendRequestGroup: NextPage<{
  items: UserOverview[];
  setModal: (userId: string) => void;
}> = observer(({ items, setModal }) => {
  const { friendStore } = useStores();
  return (
    <>
      <div
        className={`${friendStyles["friend-requests__frame"]} elevation__card__search-bar__contained-button--waiting__etc`}
      >
        <div className={`${friendStyles["friend-requests__subtitle"]}`}>
          <span
            className={`${friendStyles["friend-requests__icon"]} material-symbols-sharp`}
          >
            person_add
          </span>
          <label
            className={`${friendStyles["friend-requests__label"]} typography__text--big`}
          >
            친구 요청 목록
          </label>
        </div>
        {friendStore.friendRequestUsers.length !== 0 ? (
          <div className={`${friendStyles["friend-requests__grid"]}`}>
            {items.slice(0, 4).map((item, key) => (
              <FriendRequest item={item} key={key} setModal={setModal} />
            ))}
          </div>
        ) : (
          <label
            className={`${friendStyles["friend-requests__null"]} typography__text--big`}
          >
            친구 요청이 존재하지 않습니다.
          </label>
        )}
        <div
          style={{
            position: "absolute",
            bottom: 46,
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          {/*<PagenationBar*/}
          {/*  maxPage={friendStore.friendListMaxPage}*/}
          {/*  update={friendStore.fetchFriendList}*/}
          {/*/>*/}
        </div>
      </div>
      <style jsx>
        {`
          .material-symbols-sharp {
            font-variation-settings: "FILL" 1, "wght" 400, "GRAD" 0, "opsz" 48;
          }
        `}
      </style>
    </>
  );
});

const FriendRequest: NextPage<{
  item: UserOverview;
  setModal: (userId: string) => void;
}> = observer(({ item, setModal }) => {
  const { friendStore } = useStores();
  const { id, name, profileImage, introduce, status } = item;
  const [isModalHidden, setIsModalHidden] = useState<boolean>(true);

  useEffect(() => {
    if (isModalHidden === true) {
      window.removeEventListener("click", windowClickHandler);
    }
  }, [isModalHidden]);
  const windowClickHandler = (e: Event) => {
    if (
      (e.target as Element).id.includes(`${id}__icon--etc`) === false &&
      (e.target as Element).className.includes(
        "friend-requester__option__modal"
      ) === false
    ) {
      if (!document.getElementById(`${id}__modal`)) {
        return;
      }
      document.getElementById(`${id}__modal`)!.style.display = "none";
    }
  };

  const optionOnClick = (e: MouseEvent) => {
    setIsModalHidden(false);
    const modal = document.getElementById(`${id}__modal`)!;
    modal.style.display = "block";
    window.addEventListener("click", windowClickHandler);
  };

  return (
    <>
      <div
        className={`${friendStyles["friend-request__form"]} elevation__card__search-bar__contained-button--waiting__etc`}
      >
        <Image
          width={50}
          height={50}
          src={profileImage ? profileImage : DEFAULT_THUMBNAIL_URL}
          alt={`${name}-profileImg`}
          className={`${friendStyles["friend-request__image"]} `}
        />
        <div
          className={`${friendStyles["friend-request__info"]} typography__text`}
        >
          <div style={{ display: "flex", flexDirection: "row" }}>
            <label
              className={`${friendStyles["friend-request__name"]} typography__text`}
            >
              {name}
            </label>
          </div>
          <label
            className={`${friendStyles["friend-request__introduce"]} typography__text`}
          >
            {introduce}
          </label>
        </div>
        <div className={`${friendStyles["friend-requester__icons"]}`}>
          <span
            className={`${friendStyles["friend-requester__icon--add"]} material-symbols-sharp`}
            onClick={async () => {
              if (
                confirm(`${name} 님의 친구 요청을 수락하시겠어요?`) === true
              ) {
                await friendStore.acceptFriendRequest(id);
              }
            }}
          >
            person_add
          </span>
          <span
            id={item.id + "__icon--etc"}
            className={`${friendStyles["friend-requester__icon--etc"]} material-symbols-sharp`}
            onClick={(e) => optionOnClick(e)}
          >
            more_horiz
          </span>
          <div
            id={item.id + "__modal"}
            className={`${friendStyles["friend-requester__option__modal"]} elevation__navigation-drawer__modal-side-bottom-sheet__etc`}
          >
            <ul
              className={`${friendStyles["friend-requester__option__modal__ul"]}`}
            >
              <li
                className={`${friendStyles["friend-requester__option__modal__li"]} typography__caption`}
                onClick={async () => {
                  document.getElementById(`${id}__modal`)!.style.display =
                    "none";
                  if (
                    confirm(`${name} 님의 친구 요청을 거절하시겠어요?`) === true
                  ) {
                    await window.removeEventListener(
                      "click",
                      windowClickHandler
                    );
                    await friendStore.refuseFriendRequest(id);
                  }
                }}
              >
                친구 요청 거절
              </li>
              <li
                className={`${friendStyles["friend-requester__option__modal__li"]} typography__caption`}
                onClick={() => {
                  document.getElementById(`${id}__modal`)!.style.display =
                    "none";
                  setModal(id);
                  window.removeEventListener("click", windowClickHandler);
                }}
              >
                프로필 보기
              </li>
            </ul>
          </div>
        </div>
      </div>
      <style jsx>
        {`
          .material-symbols-sharp {
            font-variation-settings: "FILL" 1, "wght" 400, "GRAD" 0, "opsz" 30;
          }
        `}
      </style>
    </>
  );
});

const FriendRecommendGroup: NextPage<{ items: UserOverview[] }> = observer(
  ({ items }) => {
    const { friendStore } = useStores();
    return (
      <>
        <div
          className={`${friendStyles["friend-recommend__frame"]} elevation__card__search-bar__contained-button--waiting__etc`}
        >
          <div className={`${friendStyles["friend-recommend__subtitle"]}`}>
            <span
              className={`${friendStyles["friend-recommend__icon"]} material-symbols-sharp`}
            >
              recommend
            </span>
            <label
              className={`${friendStyles["friend-recommend__label"]} typography__text--big`}
            >
              추천 친구
            </label>
          </div>
          <div className={`${friendStyles["friend-recommend__not-ready"]}`}>
            <label
              className={`${friendStyles["friend-recommend__not-ready__label"]} typography__text--big`}
            >
              서비스 준비중
            </label>
          </div>
          {/*{!friendStore.errorMessage ? (*/}
          {/*  <div className={`${friendStyles["friend-recommend__grid"]}`}>*/}
          {/*    /!*{items.map((item, key) => (*!/*/}
          {/*    /!*  <FriendOverview item={item} key={key} />*!/*/}
          {/*    /!*))}*!/*/}
          {/*  </div>*/}
          {/*) : (*/}
          {/*  <p>{friendStore.errorMessage}</p>*/}
          {/*)}*/}
          {/*<div*/}
          {/*  style={{*/}
          {/*    position: "absolute",*/}
          {/*    bottom: 46,*/}
          {/*    left: "50%",*/}
          {/*    transform: "translate(-50%, -50%)",*/}
          {/*  }}*/}
          {/*>*/}
          {/*  <PagenationBar*/}
          {/*    maxPage={friendStore.friendListMaxPage}*/}
          {/*    update={friendStore.fetchFriendList}*/}
          {/*  />*/}
          {/*</div>*/}
        </div>
        <style jsx>
          {`
            .material-symbols-sharp {
              font-variation-settings: "FILL" 1, "wght" 400, "GRAD" 0, "opsz" 48;
            }
          `}
        </style>
      </>
    );
  }
);

const friends: NextPage = observer(() => {
  const router = useRouter();
  const { friendStore, userStore } = useStores();
  const [user, loading] = useAuthState(auth);
  const [modal, setModal] = useState("");
  const keyPressed = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.charCode === 13) friendStore.findUserByName();
  };

  useEffect(() => {
    if (userStore.currentUser) {
      friendStore.fetchFriendList(1);
      friendStore.fetchFriendRequests();
    }
  }, [userStore.currentUser]);

  if (loading) {
    return <div>Loading</div>;
  }

  if (!user) {
    router.replace("/login");
    return <div>Please sign in to continue</div>;
  }

  return (
    <>
      <Layout>
        <div
          className={`${friendStyles["friend-page"]}`}
          style={{
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <p className={`${friendStyles["title"]} typography__sub-headline`}>
            친구 목록
          </p>
          <div style={{ display: "flex" }}>
            {friendStore.friendListMaxPage !== -1 && (
              <FriendOverviewGroup
                items={friendStore.friendOverviews}
                setModal={setModal}
              />
            )}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <FriendRequestGroup
                items={friendStore.friendRequestUsers}
                setModal={setModal}
              />
              <FriendRecommendGroup items={friendStore.friendOverviews} />
            </div>
          </div>
        </div>
      </Layout>
      {modal !== "" && (
        <>
          <ProfileDialogContainer
            onClick={() => {
              setModal("");
            }}
          />
          <ProfileDialog userId={modal} />
        </>
      )}
    </>
  );
});
export default friends;
