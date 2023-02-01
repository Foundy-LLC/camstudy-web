import {NextApiRequest, NextApiResponse} from "next";
import prisma from "prisma/client";
import {uuidv4} from "@firebase/util";
import {setProfileErr, setProfileMsg} from "@/constants/message";

export default async function userHandler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const {method} = req;
    console.log(req.body);

    switch (method) {
        case "GET":
            break;
        case "POST":
            /**
             * 필수 값(이름, 태그) 체크
             */
            if (
                req.body.name === undefined ||
                req.body.name === null ||
                req.body.tags === undefined ||
                req.body.tags === null
            ) {
                res.status(400).json(setProfileErr);
            }

            let tagName: { name: { contains: string } }[] = [];
            let tagId;

            try {
                /**
                 * 태그 테이블에 태그 추가
                 */
                let arr: { id: string; name: string }[] = [];
                req.body.tags.forEach((tag: string) => {
                    arr.push({id: uuidv4(), name: tag});
                    tagName.push({name: {contains: tag}});
                });
                const tag = await prisma.tag.createMany({
                    data: [...arr],
                    skipDuplicates: true,
                });
                /**
                 * 태그 id 검색
                 */
                tagId = await prisma.tag.findMany({
                    where: {
                        OR: [...tagName],
                    },
                    select: {
                        id: true,
                    },
                });
                console.log(tagId);
                /**
                 * 유저 생성
                 */
                let newTagId: { tag_id: string }[] = [];
                tagId.map((x) => {
                    let y = {
                        tag_id: "",
                    };
                    y["tag_id"] = x["id"];
                    newTagId.push(y);
                });
                const response = await prisma.user_account.create({
                    data: {
                        id: req.body.uid,
                        name: req.body.name,
                        introduce: req.body.introduce,
                        score: 0,
                        status: "login",
                        user_tag: {
                            createMany: {
                                data: [...newTagId],
                            },
                        },
                    },
                });
                console.log(response);
            } catch (e) {
                throw e;
            }
            res.status(201).json(setProfileMsg);
            break;
        default:
            res.status(405).end(`Method ${method} Not Allowed`);
    }
}
