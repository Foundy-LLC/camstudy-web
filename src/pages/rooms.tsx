import { async } from "@firebase/util";
import { NextPage } from "next";
import React, { useEffect, useState } from "react";
import { useStores } from "@/stores/context";
import { type } from "os";
import { observer } from "mobx-react-lite";
const makeRoom: NextPage = observer(() => {
  const [RoomsInfo, setRoomInfo] = useState<string | null>();
  const [RoomName, setRoomName] = useState<string | null>();
  const [RoomPage, setRoomPage] = useState<string | number | null>(0);
  const { roomListStore } = useStores();
  const [result, setResult] = useState<any>();
  // useEffect(()=>{
  //     getRooms();
  // },[])
  return (
    <>
      <div style={{ height: "500px" }}>
        <h1>rooms page</h1>
        <input
          id="pageNum"
          placeholder="페이지 번호"
          onChange={(e) => {
            console.log(e.target.value);
            roomListStore.changeRoomNum(e.target.value);
          }}
        ></input>
        <button
          id="getBtn"
          onClick={async (e) => {
            await roomListStore.getRooms();
            //
          }}
        >
          GET
        </button>
        <br />
        <input
          id="roomName"
          placeholder="방 제목"
          onChange={(e) => {
            console.log(e.target.value);
            roomListStore.setRoomTitle(e.target.value);
          }}
        ></input>
        <button
          id="getBtn"
          onClick={async (e) => {
            await roomListStore.createRoom();
            //
          }}
        >
          POST
        </button>

        {/*{RoomsInfo && <p id="getResponse">{RoomsInfo}</p>}*/}
      </div>
    </>
  );
});
export default makeRoom;
