import {NextApiRequest, NextApiResponse} from "next";
import client from "prisma/client"
import toJson from "./bigIntToJson";

export default async function userHandler(req: NextApiRequest, res: NextApiResponse) {
    const {body, method} = req;
    switch (method) {
        case 'GET':
            const rooms = await client.room.findMany()
            return res.status(200).json(
                toJson(rooms)
            );
        case 'POST':
            const room = await client.room.create({
                data: {
                    id:4,        
                    master_id:1,    
                    title: body.title,
                    thumnail: body.thumnail? body.thumnail: null,     
                    password: body.password? body.password: null,     
                    timer: 100,           
                    short_break:10,
                    long_break:15,     
                    long_break_interval: 3,
                    expired_at: '2021-08-21T12:30:00.000Z',           
                },
            })
            return res.status(200).json(
                toJson(room)
            );
    }
}