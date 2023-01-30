import {NextApiRequest, NextApiResponse} from "next";
import {PrismaClient} from "@prisma/client";

export default async function userHandler(req: NextApiRequest, res: NextApiResponse) {
    const {query, method, body} = req;
    // const id = parseInt(query.userId as string, 10)
    console.log(req.body)

    switch (method) {
        case 'GET':
            // Get data from your database
            // res.status(200).json({ id, name: `User ${id}` })
            break
        case 'POST':
            try {
                const prisma = new PrismaClient()
                const response = await prisma.user_account.create({
                    data: {
                        id: req.body.uid,
                        name: req.body.name,
                        introduce: req.body.introduce,
                        score: 0,
                        status: 'login'
                    },
                })
                console.log(response)
            } catch (e) {
                console.log(e)
            }

            // console.log(`${req.body.name}`)
            // setProfile(body)
            // Get data from your database
            // res.status(200).json({ id, name: `User ${id}` })
            break
        case 'PUT':
            // Update or create data in your database
            // res.status(200).json({ id, name: name || `User ${id}` })
            break
        default:
            res.setHeader('Allow', ['GET', 'PUT'])
            res.status(405).end(`Method ${method} Not Allowed`)
    }
}