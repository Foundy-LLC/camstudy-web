import {PrismaClient} from "@prisma/client";

interface setProfile {
    "uid": string,
    "name": string,
    "introduce": string | null | undefined,
    "tags": Array<string>
}

export default async function setProfile(req: setProfile) {
    console.log("setProfile", req);
    const {uid, name, introduce, tags} = req


    try {
        const prisma = new PrismaClient()
        const response = await prisma.user_account.create({
            data: {
                id: uid,
                name: name,
                introduce: introduce,
                score: 0,
                status: 'login'
            },
        })
        console.log(response)
    } catch (e) {
        console.log(e)
    }

}