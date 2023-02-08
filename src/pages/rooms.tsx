import { NextPage } from "next";
import React, { Key } from "react";
import { useStores } from "@/stores/context";
import { observer } from "mobx-react-lite";
import { RoomOverview } from "@/models/room/RoomOverview";

const RoomItem: NextPage<{ roomOverview: RoomOverview; key: Key }> = observer(
  ({ roomOverview, key }) => {
    return <p key={key}>{roomOverview.title}</p>;
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

const RoomList: NextPage = observer(() => {
  const { roomListStore } = useStores();

  return (
    <>
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
        <br />
        <input
          id="roomName"
          placeholder="방 제목"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            console.log(e.target.value);
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
        <RoomItemGroup items={roomListStore.roomOverviews} />
        <div>
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