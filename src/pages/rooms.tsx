import { async } from "@firebase/util";
import { NextPage } from "next";
import React, { useEffect, useState } from "react";
import { useStores } from "@/stores/context";
import { type } from "os";
import { observer } from "mobx-react-lite";
import { RoomOverview } from "@/models/room/RoomOverview";
const makeRoom: NextPage = observer(() => {
  const { roomListStore } = useStores();
  const [isSuccessCreate, setIsSuccessCreate] = useState<boolean>(false);
  const successToCreate = roomListStore.get_roomOverviews();
  const printRoomTitles = (): JSX.Element[] => {
    const roomTitles = roomListStore
      .get_roomOverviews()
      .map((room, key) => <p key={key}>{room.title}</p>);
    return roomTitles;
  };
  const printCreatedRoomTitle = (): JSX.Element => {
    return (
      <div>
        <h3>생성한 방:</h3>
        <p>{roomListStore.get_created_title()}</p>
      </div>
    );
  };
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
            const result = await roomListStore.createRoom();
            if (result === true) setIsSuccessCreate(true);
          }}
        >
          POST
        </button>
        {printRoomTitles()}
        {isSuccessCreate && printCreatedRoomTitle()}
        {/*{RoomsInfo && <p id="getResponse">{RoomsInfo}</p>}*/}
      </div>
    </>
  );
});
export default makeRoom;
