import { async } from "@firebase/util";
import { NextPage } from "next";
import React, { useEffect, useState } from "react";
import { useStores } from "@/stores/context";
import { type } from "os";
import { observer } from "mobx-react-lite";
import { Room } from "@/stores/RoomListStore";
const makeRoom: NextPage = observer(() => {
  const [RoomsInfo, setRoomInfo] = useState<string | null>();
  const [RoomName, setRoomName] = useState<string | null>();
  const [RoomPage, setRoomPage] = useState<string | number | null>(0);
  const { roomListStore } = useStores();
  const [result, setResult] = useState<any>();
  // useEffect(()=>{
  //     getRooms();
  // },[])

  const createRoom = async () => {
    const response = await fetch(`api/rooms`, {
      method: "POST",
      body: JSON.stringify({
        //예시 값
        id: RoomName, //임시적으로 roomId를 title 값과 같도록 바꿈
        master_id: "masterId",
        password: "1111",
        title: RoomName,
        timer: 40,
        short_break: 10,
        long_break: 15,
        long_break_interval: 3,
        expired_at: "2021-08-21T12:30:00.000Z",
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const resJson = await response.json();
    const {
      id,
      master_id,
      title,
      thumnail,
      password,
      timer,
      short_break,
      long_break,
      long_break_interval,
      expired_at,
    } = resJson;
    roomListStore.createRoom(
      id,
      master_id,
      title,
      thumnail,
      password,
      timer,
      short_break,
      long_break,
      long_break_interval,
      expired_at
    );
    console.log(id);
    if (resJson !== undefined) {
      setRoomInfo(
        "생성된 방 id: " +
          roomListStore.rooms[roomListStore.rooms.length - 1].id
      );
    }
  };

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

        {roomListStore &&
          roomListStore.rooms.map((room, key) => {
            console.log(room.id, "fff");
            return <p key={key}>{room.id}</p>;
          })}
        {RoomsInfo && <p id="getResponse">{RoomsInfo}</p>}
      </div>
    </>
  );
});
export default makeRoom;
