import { async } from "@firebase/util";
import {NextPage} from "next";
import React, {useEffect, useState} from "react";
import { useStores } from "@/stores/context";
import { type } from "os";
import { observer } from "mobx-react-lite";
const makeRoom: NextPage = observer(() =>{
    const [RoomsInfo, setRoomInfo] = useState<string|null>();
    const [RoomName, setRoomName] = useState<string|null>();
    const [RoomPage, setRoomPage] = useState<string|number|null>(0);
    const {roomStore} = useStores();

    // useEffect(()=>{
    //     getRooms();
    // },[])

    const getRooms = async() =>{
        const response = await fetch(`api/rooms?page=${RoomPage}`, {
            method: "GET",
            headers:{
                'Content-Type': 'application/json'
            },
        });
        const resJson = await response.json();
        console.log(resJson);
        resJson.map((value:any)=>{
            roomStore.createRoom(
                value.id,
                value.master_id,
                value.title,
                value.thumnail,
                value.password,
                value.timer,
                value.short_break,
                value.long_break,
                value.long_break_interval,
                value.expired_at,
                )
        });
        if(resJson !== undefined){
            var Rooms:string = "방 조회 결과:";
            roomStore.rooms.map(room =>{ 
                Rooms +=`, ${room.id}`
            });
            setRoomInfo(Rooms);
        }
    }
    
    const createRoom = async () => {
        const response = await fetch(`api/rooms`, {
            method: "POST",
            body: JSON.stringify({ //예시 값
                id:RoomName,  //임시적으로 roomId를 title 값과 같도록 바꿈
                master_id:"masterId",  
                password:"1111", 
                title: RoomName,
                timer: 40,           
                short_break:10,
                long_break:15,    
                long_break_interval: 3,
                expired_at: '2021-08-21T12:30:00.000Z',   
            }),
            headers:{
                'Content-Type': 'application/json'
            }
        });
        const resJson = await response.json();
        const {id, master_id, title, thumnail, password, timer, short_break, long_break, long_break_interval, expired_at} = resJson;
        roomStore.createRoom(
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
            )
        console.log(id);
        if(resJson !== undefined){
            setRoomInfo("생성된 방 id: "+roomStore.rooms[roomStore.rooms.length-1].id);
        }
    }

    const setName = (e:React.ChangeEvent<HTMLInputElement>) => {
        const {target: {value}} = e;
        setRoomName(value);
    }

    const changePageNum = (e:React.ChangeEvent<HTMLInputElement>)=> {
        const {target: {value}} = e;
        setRoomPage(value);
    }

    return(
        <>
            <div style={{height:"500px"}}>
                <h1>rooms page</h1>
                <input id="pageNum" placeholder="페이지 번호" onChange={changePageNum}></input>
                <button id="getBtn" onClick={getRooms}>GET</button>    
                <br/>
                <input id="roomName" placeholder="방 제목" onChange={setName}></input>
                <button id="getBtn" onClick={createRoom}>POST</button>
                {roomStore && roomStore.rooms.map((room,key)=><p key={key}>{room.id}</p>)}
                {RoomsInfo && <p id="getResponse">{RoomsInfo}</p>}
            </div>
            
        </>    
    );
})
export default makeRoom;