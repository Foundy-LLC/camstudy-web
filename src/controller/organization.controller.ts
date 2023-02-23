import { NextApiRequest, NextApiResponse } from "next";
import { ResponseBody } from "@/models/common/ResponseBody";
import {
  REQUEST_QUERY_ERROR,
  SERVER_INTERNAL_ERROR_MESSAGE,
} from "@/constants/message";
import {
  addOrganizationEmailVerify,
  findOrganizations,
  updateEmailVerifyStatus,
} from "@/repository/organization.repository";
import {
  ORGANIZATIONS_EMAIL_CONFIRM_SUCCESS,
  ORGANIZATIONS_EMAIL_SEND_FAIL,
  ORGANIZATIONS_EMAIL_SEND_SUCCESS,
  ORGANIZATIONS_GET_SUCCESS,
} from "@/constants/organizationMessage";
import { OrganizationsGetRequestBody } from "@/models/organization/OrganizationsGetRequestBody";
import { OrganizationsEmailRequestBody } from "@/models/organization/OrganizationsEmailRequestBody";
import { sendSecretMail } from "@/components/SendEmail";
import { Prisma } from "@prisma/client";
import { OrganizationsEmailConfirmBody } from "@/models/organization/OrganizationsEmailConfirmBody";
import { verifyEmailToken } from "@/service/manageVerifyToken";
import { TokenExpiredError } from "jsonwebtoken";

interface JwtPayload {
  userId: string;
  organizationId: string;
}
export const confirmOrganizationEmail = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const { AccessToken } = req.body;
  try {
    const { userId, organizationId } = verifyEmailToken(
      AccessToken
    ) as JwtPayload;
    const organizationsEmailConfirmBody = new OrganizationsEmailConfirmBody(
      userId,
      organizationId
    );
    await updateEmailVerifyStatus(
      organizationsEmailConfirmBody.userId,
      organizationsEmailConfirmBody.organizationId
    );
    res.status(200).send(
      new ResponseBody({
        message: ORGANIZATIONS_EMAIL_CONFIRM_SUCCESS,
      })
    );
  } catch (e) {
    if (typeof e === "string") {
      res.status(400).send(new ResponseBody({ message: e }));
      return;
    } else if (e instanceof Prisma.PrismaClientKnownRequestError) {
      res.status(409).send(
        new ResponseBody({
          message: e.message,
        })
      );
      return;
    } else if (e instanceof TokenExpiredError) {
      res.status(401).send(
        new ResponseBody({
          message:
            "이메일 인증 기간이 만료되었습니다. 다시 인증 요청을 보내주세요.",
        })
      );
    }
    res
      .status(500)
      .send(new ResponseBody({ message: SERVER_INTERNAL_ERROR_MESSAGE }));
  }
};

export const setOrganizationEmail = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const { userId, userName, email, organizationId } = req.body;
  try {
    const organizationsEmailRequestBody = new OrganizationsEmailRequestBody(
      userId,
      userName,
      email,
      organizationId
    );
    await addOrganizationEmailVerify(
      organizationsEmailRequestBody.userId,
      organizationsEmailRequestBody.email,
      organizationsEmailRequestBody.organizationId
    );
    if (!sendSecretMail(email, userId, userName, organizationId))
      throw ORGANIZATIONS_EMAIL_SEND_FAIL;
    res.status(201).json(
      new ResponseBody({
        message: ORGANIZATIONS_EMAIL_SEND_SUCCESS,
      })
    );
  } catch (e) {
    if (typeof e === "string") {
      res.status(400).send(new ResponseBody({ message: e }));
      return;
    } else if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      res.status(409).send(
        new ResponseBody({
          message: "이미 해당 소속으로 인증 이메일이 발송되었습니다",
        })
      );
      return;
    }
    console.log(typeof e);
    res
      .status(500)
      .send(new ResponseBody({ message: SERVER_INTERNAL_ERROR_MESSAGE }));
  }
};

export const getOrganizations = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const { name, page } = req.query;
  try {
    if (typeof page !== "string") throw REQUEST_QUERY_ERROR;

    const organizationsGetBody =
      typeof name === "string"
        ? new OrganizationsGetRequestBody(page, name)
        : new OrganizationsGetRequestBody(page);

    const result = await findOrganizations(
      organizationsGetBody.pageNum,
      organizationsGetBody.name
    );
    res.status(201).json(
      new ResponseBody({
        data: result,
        message: ORGANIZATIONS_GET_SUCCESS,
      })
    );
  } catch (e) {
    if (typeof e === "string") {
      res.status(400).send(new ResponseBody({ message: e }));
      return;
    }
    res
      .status(500)
      .send(new ResponseBody({ message: SERVER_INTERNAL_ERROR_MESSAGE }));
  }
};
