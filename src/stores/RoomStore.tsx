import {action, makeObservable, observable} from "mobx";

class Room {
    id:string;
    master_id:string;
    title:string;
    thumnail:string | undefined;
    password:string | undefined;
    timer:number;
    short_break:number;
    long_break:number;
    long_break_interval:number;
    expired_at:string;

    constructor(
        id:string,
        master_id:string,
        title:string,
        thumnail:string|undefined,
        password:string|undefined,
        timer:number,
        short_break:number,
        long_break:number,
        long_break_interval:number,
        expired_at:string){
            this.id = id;
            this.master_id = master_id;
            this.title = title;
            this.thumnail = thumnail;
            this.password = password;
            this.timer = timer;
            this.short_break = short_break;
            this.long_break = long_break;
            this.long_break_interval = long_break_interval;
            this.expired_at   = expired_at   ;
        }
}

export class RoomStore{
    rootStore;
    rooms:Room[] = [];

    constructor(root:any){
        makeObservable(this, {
            rooms : observable,
            createRoom: action,
            deleteRoom: action,
            changeRoomInfo: action,
        })
        this.rootStore = root;
    }

    createRoom(
        id:string,
        master_id:string,
        title:string,
        thumnail:string|undefined,
        password:string|undefined,
        timer:number,
        short_break:number,
        long_break:number,
        long_break_interval:number,
        expired_at:string
        ){
        const idx = this.rooms.findIndex( x => x.id === id);
        if(idx !== undefined) {
            this.rooms = [
                ...this.rooms,
                new Room(
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
                    ),
            ]
        }
    }

    deleteRoom( 
        id:string,
        ){
            this.rooms = this.rooms.filter( x => x.id !== id);
    }

    changeRoomInfo(
        id:string,
        master_id:string,
        title:string,
        thumnail:string|undefined,
        password:string|undefined,
        timer:number,
        short_break:number,
        long_break:number,
        long_break_interval:number,
        expired_at:string
    ){
        const idx = this.rooms.findIndex( x => x.id === id);
        const room = this.rooms[idx];

        this.rooms = [
            ...this.rooms.slice(0, idx),
            new Room(
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
                ),
            ...this.rooms.slice(idx+1, this.rooms.length),
        ]
    }
}