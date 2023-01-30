import { async } from "@firebase/util";
import {NextPage} from "next";
import React, {useState} from "react";

const makeRoom: NextPage = () =>{
    const [RoomsInfo, setRoomInfo] = useState<string|null>();
    const [RoomName, setRoomName] = useState<string|null>();
    const [RoomPage, setRoomPage] = useState<string|number|null>(0);

    const getRooms = async() =>{
        const response = await fetch(`api/rooms?page=${RoomPage}`, {
            method: "GET",
            headers:{
                'Content-Type': 'application/json'
            },
        });
        console.log("response");
        const resJson = await response.json();
        if(resJson !== undefined){
            setRoomInfo(resJson);
        }
    }
    
    const createRoom = async () => {
        const response = await fetch(`api/rooms`, {
            method: "POST",
            body: JSON.stringify({ //예시 값
                id:"room10Id",      
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
        console.log("response");
        if(resJson !== undefined){
            setRoomInfo(resJson);
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
            <h1>rooms page</h1>
            <input id="pageNum" placeholder="페이지 번호" onChange={changePageNum}></input>
            <button id="getBtn" onClick={getRooms}>GET</button>    
            <br/>
            <input id="roomName" placeholder="방 제목" onChange={setName}></input>
            <button id="getBtn" onClick={createRoom}>POST</button>
            
            {RoomsInfo && <p id="getResponse">{RoomsInfo}</p>}
            
        </>    
    );
}
export default makeRoom;