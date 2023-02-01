// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import {PrismaClient} from '@prisma/client'
import * as console from "console";

type Data = {
  name: string
}

const prisma = new PrismaClient()
const newUser = async () => {
  await prisma.user_account.create({
    data: {
      id: 'test_id',
      name: 'test',
      introduce: 'hi',
      score: 0,
      status: 'login'
    },
  })
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  newUser()
  res.status(200).json({ name: 'John Doe' })
}
