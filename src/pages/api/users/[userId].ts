import {NextApiRequest, NextApiResponse} from "next";
import setProfile from "@/controller/users";

export default function userHandler(req: NextApiRequest, res: NextApiResponse) {
    const {query, method} = req;
    const id = parseInt(query.userId as string, 10)
    const name = query.name as string

    switch (method) {
        case 'GET':
            // Get data from your database
            res.status(200).json({ id, name: `User ${id}` })
            break
        case 'POST':
            // console.log(`${req.body.name}`)
            setProfile(req.body)
            // Get data from your database
            // res.status(200).json({ id, name: `User ${id}` })
            break
        case 'PUT':
            // Update or create data in your database
            res.status(200).json({ id, name: name || `User ${id}` })
            break
        default:
            res.setHeader('Allow', ['GET', 'PUT'])
            res.status(405).end(`Method ${method} Not Allowed`)
    }
}