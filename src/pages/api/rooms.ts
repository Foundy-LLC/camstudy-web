import { NextApiRequest, NextApiResponse } from "next";
import client from "prisma/client";
import { json } from "stream/consumers";
import { string } from "prop-types";
import { getRoom, postRoom } from "@/controller/room.controller";

export default async function userHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const ROOM_NUM_PER_PAGE = 30 as const;
  const { body, method, query } = req;
  switch (method) {
    case "GET":
      await getRoom(req, res);

    case "POST":
      if (body.password && JSON.stringify(body.password).length - 2 < 4) {
        //큰 따옴표 제외
        res.status(400).end("비밀번호는 4자 이상으로 설정해야 합니다.");
      }
      if (body.timer && (body.timer < 20 || body.timer > 50)) {
        res.status(400).end("공부 시간은 20~50분으로만 설정할 수 있습니다.");
      }
      if (body.short_break && (body.short_break < 3 || body.short_break > 10)) {
        res
          .status(400)
          .end("짧은 쉬는 시간은 3~10분 범위로만 설정할 수 있습니다.");
      }
      if (body.long_break && (body.long_break < 10 || body.long_break > 30)) {
        res.status(400).end("긴 쉬는 시간은 10~30분으로만 설정할 수 있습니다.");
      }
      if (
        body.long_break_interval &&
        (body.long_break_interval < 2 || body.long_break_interval > 6)
      ) {
        res.status(400).end("쉬는 시간 인터벌은 2~6회로만 설정할 수 있습니다.");
      }
      const room = await client.room.create({
        data: {
          id: body.id,
          master_id: body.master_id,
          title: body.title,
          thumnail: body.thumnail ? body.thumnail : null,
          password: body.password ? body.password : null,
          timer: body.timer,
          short_break: body.short_break,
          long_break: body.long_break,
          long_break_interval: body.long_break_interval,
          expired_at: body.expired_at,
        },
      });
      return res.status(200).json(room);
    default:
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
