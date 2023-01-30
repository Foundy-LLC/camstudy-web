import { async } from "@firebase/util";
import {NextPage} from "next";
import React, {useState} from "react";

const makeRoom: NextPage = () =>{
    const [RoomsInfo, setRoomInfo] = useState();
    const [RoomName, setRoomName] = useState();
    const getRooms = async() =>{
        const response = await fetch(`api/rooms`, {
            method: "GET",
            headers:{
                'Content-Type': 'application/json'
            }
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
            body: JSON.stringify({
                title:RoomName,
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

    const setName = (e:any) => {
        const {target: {value}} = e;
        setRoomName(value);
    }

    return(
        <>
            <h1>rooms page</h1>
            <button id="getBtn" onClick={getRooms}>GET</button>    
            <br/>
            <input id="roomName" placeholder="방 제목" onChange={setName}></input>
            <button id="getBtn" onClick={createRoom}>POST</button>
            
            {RoomsInfo && <p id="getResponse">{RoomsInfo}</p>}
            
        </>    
    );
}
export default makeRoom;