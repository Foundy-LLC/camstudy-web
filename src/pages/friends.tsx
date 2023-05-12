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
import { Header } from "@/components/Header";
import { SideMenuBar } from "@/components/SideMenuBar";
import { PagenationBar } from "@/components/PagenationBar";

// const SimilarNamedUser: NextPage<{ item: UserSearchOverview }> = observer(
//   ({ item }) => {
//     const [statusImage, setStatusImage] = useState<string>(
//       "https://uxwing.com/wp-content/themes/uxwing/download/user-interface/add-plus-icon.png"
//     );
//     const { friendStore } = useStores();
//     const { name, id, requestHistory } = item;
//
//     useEffect(() => {
//       if (requestHistory === friendStatus.ACCEPTED) {
//         setStatusImage(
//           "https://uxwing.com/wp-content/themes/uxwing/download/checkmark-cross/blue-check-mark-icon.png"
//         );
//       } else if (requestHistory === friendStatus.REQUESTED) {
//         setStatusImage(
//           "https://uxwing.com/wp-content/themes/uxwing/download/festival-culture-religion/cracker-color-icon.png"
//         );
//       } else {
//         setStatusImage(
//           "https://uxwing.com/wp-content/themes/uxwing/download/user-interface/add-plus-icon.png"
//         );
//       }
//     }, [requestHistory]);
//     return (
//       <>
//         <h3 style={{ display: "inline" }}>{name}</h3>{" "}
//         <i>#{id.substring(0, 5)}&nbsp;</i>
//         <Image
//           src={statusImage}
//           width={18}
//           height={18}
//           alt="select"
//           onClick={async () => {
//             switch (requestHistory) {
//               case "ACCEPTED":
//                 break;
//               case "NONE":
//                 await friendStore.sendFriendRequest(id);
//                 break;
//               case "REQUESTED":
//                 if (confirm("친구 요청을 취소하시겠어요?") === true) {
//                   await friendStore.cancelFriendRequest(id);
//                 }
//                 break;
//             }
//           }}
//         />
//         <br />
//       </>
//     );
//   }
// );
//
// const SimilarNamedUserGroup: NextPage<{ items: UserSearchOverview[] }> =
//   observer(({ items }) => {
//     return (
//       <>
//         {items.map((item, key) => (
//           <SimilarNamedUser item={item} key={key} />
//         ))}
//       </>
//     );
//   });

// const FriendRequest: NextPage<{ item: UserOverview }> = observer(({ item }) => {
//   const { id, name, profileImage, introduce, status } = item;
//   const { friendStore } = useStores();
//   return (
//     <>
//       <Image
//         width={50}
//         height={50}
//         src={profileImage ? profileImage : DEFAULT_THUMBNAIL_URL}
//         alt={`${name}-profileImg`}
//       />
//       <h3>{name}</h3>
//       <Image
//         width={18}
//         height={18}
//         src="https://uxwing.com/wp-content/themes/uxwing/download/checkmark-cross/accept-icon.png"
//         alt="accept"
//         onClick={async () => {
//           if (confirm("친구 요청을 수락하시겠어요?") === true) {
//             await friendStore.acceptFriendRequest(id);
//           }
//         }}
//       />
//       <Image
//         width={18}
//         height={18}
//         src="https://uxwing.com/wp-content/themes/uxwing/download/checkmark-cross/cancel-icon.png"
//         alt="reject"
//         onClick={async () => {
//           if (confirm("친구 요청을 거절하시겠어요?") === true) {
//             await friendStore.refuseFriendRequest(id);
//           }
//         }}
//       />
//     </>
//   );
// });
//
// const FriendRequestGroup: NextPage<{ items: UserOverview[] }> = observer(
//   ({ items }) => {
//     return (
//       <>
//         {items.map((item, key) => (
//           <FriendRequest item={item} key={key} />
//         ))}
//       </>
//     );
//   }
// );

//TODO(건우): 옵션 버튼 다크 모드 시 배경색 때문에 사라지는 현상 수정 필요
const FriendOverview: NextPage<{ item: UserOverview }> = observer(
  ({ item }) => {
    const { friendStore } = useStores();
    const { id, name, profileImage, introduce, status } = item;
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
            <label
              className={`${friendStyles["friend-name"]} typography__text`}
            >
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
              fontFamily: "Pretendard",
              fontWeight: "400",
            }}
          >
            {introduce}
          </label>
        </div>
        <button
          className={`${friendStyles["friend-option-button"]}`}
          onClick={async () => {
            if (confirm(`${name}을 친구 목록에서 삭제하시겠어요?`) === true) {
              await friendStore.deleteFriend(id);
            }
          }}
        >
          <Image
            className={`${friendStyles["friend-option-icon"]}`}
            alt={"friend-option-icon"}
            src={optionIcon}
          />
        </button>
      </div>
    );
  }
);

const FriendOverviewGroup: NextPage<{ items: UserOverview[] }> = observer(
  ({ items }) => {
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
            <div className={`${friendStyles["friend-list-grid"]}`}>
              {items.map((item, key) => (
                <FriendOverview item={item} key={key} />
              ))}
            </div>
          ) : (
            <p>{friendStore.errorMessage}</p>
          )}
          <div
            style={{
              position: "absolute",
              bottom: 46,
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <PagenationBar
              maxPage={friendStore.friendListMaxPage}
              update={friendStore.fetchFriendList}
            />
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
  }
);

const FriendRequestGroup: NextPage<{ items: UserOverview[] }> = observer(
  ({ items }) => {
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
                <FriendRequest item={item} key={key} />
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
  }
);

const FriendRequest: NextPage<{ item: UserOverview }> = observer(({ item }) => {
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
            font-variation-settings: "FILL" 1, "wght" 400, "GRAD" 0, "opsz" 48;
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
      <section className={"box"}>
        <div className={"box-header-margin"}>
          <Header userId={user.uid} />
        </div>
        <div className={"box-contents-margin"}>
          <div className={"box-contents"}>
            <div className={"box-contents-side-menu"}>
              <SideMenuBar userId={user.uid}></SideMenuBar>
            </div>
            <div className={"box-contents-item"}>
              <div
                className={`${friendStyles["friend-page"]}`}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                }}
              >
                <p
                  className={`${friendStyles["title"]} typography__sub-headline`}
                >
                  친구 목록
                </p>
                <div style={{ display: "flex" }}>
                  {friendStore.friendListMaxPage !== -1 && (
                    <FriendOverviewGroup items={friendStore.friendOverviews} />
                  )}
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <FriendRequestGroup
                      items={friendStore.friendRequestUsers}
                    />
                    <FriendRecommendGroup items={friendStore.friendOverviews} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
});
export default friends;
