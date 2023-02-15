import { NextPage } from "next";
import React, { Key, useEffect } from "react";
import { useStores } from "@/stores/context";
import { observer } from "mobx-react-lite";
import { RoomOverview } from "@/models/room/RoomOverview";
import Image from "next/image";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/service/firebase";
import { useRouter } from "next/router";
import userStore from "@/stores/UserStore";

const RoomItem: NextPage<{ roomOverview: RoomOverview }> = observer(
  ({ roomOverview }) => {
    const { roomListStore } = useStores();
    const [user] = useAuthState(auth);
    return (
      <div>
        {!roomOverview.hasPassword ? null : (
          <Image
            src={
              "https://uxwing.com/wp-content/themes/uxwing/download/editing-user-action/padlock-black-icon.png"
            }
            width={7}
            height={10}
            alt="locked"
            style={{ display: "inline" }}
          />
        )}
        <h3 style={{ display: "inline" }}>{roomOverview.title}</h3>
        <p style={{ display: "inline" }}>
          :{roomOverview.joinCount}/{roomOverview.maxCount}
        </p>
        {roomOverview.masterId === user?.uid ? (
          <Image
            src={
              "https://uxwing.com/wp-content/themes/uxwing/download/checkmark-cross/red-x-icon.png"
            }
            width={13}
            height={13}
            alt="locked"
            onClick={() => {
              if (
                confirm(`"${roomOverview.title}"방을 삭제하시겠습니까?`) ===
                true
              ) {
                console.log(`${roomOverview.title}방이 삭제되었습니다`);
                roomListStore.deleteRoom(roomOverview.id);
              } else return;
            }}
          />
        ) : null}
      </div>
    );
  }
);

const RoomItemGroup: NextPage<{ items: RoomOverview[] }> = observer(
  ({ items }) => {
    return (
      <>
        {items.map((item) => (
          <RoomItem roomOverview={item} key={item.id} />
        ))}
      </>
    );
  }
);

const SelectedThumbnailImage: NextPage<{ imageUrl: string }> = observer(
  ({ imageUrl }) => {
    if (imageUrl === "") return <></>;
    console.log(imageUrl);
    return (
      <Image src={imageUrl} alt="방 썸네일 사진" width={100} height={100} />
    );
  }
);

const RoomList: NextPage = observer(() => {
  const router = useRouter();
  const { roomListStore } = useStores();
  const [user, loading] = useAuthState(auth);

  useEffect(() => {
    if (user) {
      roomListStore.setMasterId(user.uid);
    }
  }, [user]);

  if (loading) {
    return <div>Loading</div>;
  }
  if (!user) {
    router.replace("/login");
    return <div>Please sign in to continue</div>;
  }
  return (
    <>
      <div>
        <button
          id="sign-out"
          style={{
            float: "right",
            marginRight: "30px",
            width: "100px",
            height: "30px",
          }}
          onClick={() => userStore.signOut()}
        >
          sign out
        </button>
      </div>
      <div>
        <h1>rooms page</h1>

        <input
          id="pageNum"
          placeholder="페이지 번호"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            console.log(e.target.value);
            roomListStore.changeRoomNum(e.target.value);
          }}
        ></input>
        <button
          id="getBtn"
          onClick={async () => {
            await roomListStore.fetchRooms();
          }}
        >
          GET
        </button>
        <button
          id="recentRoomBtn"
          onClick={async () => {
            await roomListStore.fetchRecentRooms(user.uid);
          }}
        >
          최근 방 조회
        </button>
        <br />
        <input
          id="roomName"
          placeholder="방 제목"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            roomListStore.setRoomTitleInput(e.target.value);
          }}
        ></input>
        <button
          id="PostBtn"
          onClick={async () => {
            await roomListStore.createRoom();
          }}
        >
          POST
        </button>
        <br />
        <input
          id="roomThumbnail"
          type="file"
          accept="image/png, image/jpeg"
          onChange={(e) => {
            if (e.target.files) {
              roomListStore.importRoomThumbnail(e.target.files[0]);
            }
          }}
        ></input>
        <SelectedThumbnailImage imageUrl={roomListStore.imageUrl} />
        <RoomItemGroup items={roomListStore.roomOverviews} />
        <div>
          <br />
          <h3>생성한 방:</h3>
          <p>{roomListStore.createdTitle}</p>
        </div>

        {roomListStore.errorMessage === "" ? null : (
          <h3>{roomListStore.errorMessage}</h3>
        )}
        {/*{RoomsInfo && <p id="getResponse">{RoomsInfo}</p>}*/}
      </div>
    </>
  );
});
export default RoomList;
