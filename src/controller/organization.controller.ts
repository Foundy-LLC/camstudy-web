import { NextApiRequest, NextApiResponse } from "next";
import { ResponseBody } from "@/models/common/ResponseBody";
import {
  EMAIL_ID_REQUEST_ERROR,
  ORGANIZATION_ID_REQUEST_ERROR,
  ORGANIZATION_NOT_EXISTS_ERROR,
  REQUEST_QUERY_ERROR,
  SERVER_INTERNAL_ERROR_MESSAGE,
  USER_ID_REQUEST_ERROR,
  USER_NOT_EXISTS_ERROR,
} from "@/constants/message";
import {
  addOrganizationEmailVerify,
  deleteBelong,
  findBelongOrganizations,
  findOrganizations,
  getOrganizationName,
  updateEmailVerifyStatus,
  updateOrganizationEmailVerify,
  verifyBelong,
} from "@/repository/organization.repository";
import {
  BELONG_ORGANIZATIONS_GET_SUCCESS,
  ORGANIZATION_EMAIL_VERIFY_DUPLICATED,
  ORGANIZATIONS_EMAIL_CONFIRM_SUCCESS,
  ORGANIZATIONS_EMAIL_SEND_FAIL,
  ORGANIZATIONS_EMAIL_SEND_SUCCESS,
  ORGANIZATIONS_GET_SUCCESS,
} from "@/constants/organizationMessage";
import { OrganizationsGetRequestBody } from "@/models/organization/OrganizationsGetRequestBody";
import { OrganizationsEmailRequestBody } from "@/models/organization/OrganizationsEmailRequestBody";
import { sendSecretMail } from "@/components/SendEmail";
import { Prisma } from "@prisma/client";
import { verifyEmailToken } from "@/service/manageVerifyToken";
import { TokenExpiredError } from "jsonwebtoken";
import { UidValidationRequestBody } from "@/models/common/UidValidationRequestBody";
import { BelongOrganization } from "@/models/organization/BelongOrganization";
import { OrganizationsBelongConfirmRequestBody } from "@/models/organization/OrganizationsBelongConfirmRequestBody";
import { getUserName } from "@/repository/user.repository";

interface JwtPayload {
  userId: string;
  organizationId: string;
  organizationName: string;
}

export const confirmOrganizationEmail = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const { AccessToken } = req.body;
  try {
    const { userId, organizationId, organizationName } = verifyEmailToken(
      AccessToken
    ) as JwtPayload;
    const organizationsEmailConfirmBody =
      new OrganizationsBelongConfirmRequestBody(
        userId,
        organizationId,
        organizationName
      );
    const verifiedOrganization = await updateEmailVerifyStatus(
      organizationsEmailConfirmBody.userId,
      organizationsEmailConfirmBody.organizationId
    );
    const belongOrganization: BelongOrganization = {
      userId: verifiedOrganization.user_id,
      organizationId: verifiedOrganization.organization_id,
      organizationName: organizationName,
    };
    res.status(200).send(
      new ResponseBody({
        data: belongOrganization,
        message: ORGANIZATIONS_EMAIL_CONFIRM_SUCCESS,
      })
    );
  } catch (e) {
    if (typeof e === "string") {
      res.status(400).send(new ResponseBody({ message: e }));
      return;
    }
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      res.status(409).send(
        new ResponseBody({
          message: e.message,
        })
      );
      return;
    }
    if (e instanceof TokenExpiredError) {
      res.status(401).send(
        new ResponseBody({
          message:
            "이메일 인증 기간이 만료되었습니다. 다시 인증 요청을 보내주세요.",
        })
      );
      return;
    }
    res
      .status(500)
      .send(new ResponseBody({ message: SERVER_INTERNAL_ERROR_MESSAGE }));
  }
};

export const deleteBelongOrganization = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const { userId, organizationId } = req.query;
    if (typeof organizationId !== "string") {
      throw ORGANIZATION_ID_REQUEST_ERROR;
    }
    if (typeof userId !== "string") {
      throw USER_ID_REQUEST_ERROR;
    }
    await deleteBelong(userId, organizationId);
    res
      .status(200)
      .json(new ResponseBody({ message: `해당 소속을 삭제하였습니다.` }));
  } catch (e) {}
};

export const setOrganizationEmail = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const { userId } = req.query;
  const { email, organizationId } = req.body;
  try {
    if (typeof userId !== "string") throw USER_ID_REQUEST_ERROR;
    if (typeof email !== "string") throw EMAIL_ID_REQUEST_ERROR;
    if (typeof organizationId !== "string") throw ORGANIZATION_ID_REQUEST_ERROR;

    const organizationsEmailRequestBody = new OrganizationsEmailRequestBody(
      userId,
      email,
      organizationId
    );

    const userName = await getUserName(userId);
    if (userName == null) {
      throw USER_NOT_EXISTS_ERROR;
    }
    const organizationName = await getOrganizationName(organizationId);
    if (organizationName == null) {
      throw ORGANIZATION_NOT_EXISTS_ERROR;
    }
    // 해당 소속이 이미 인증되어 있는 지 확인
    const verify = await verifyBelong(userId, organizationId);
    if (verify?.isAuthenticated) {
      res
        .status(409)
        .send(
          new ResponseBody({ message: ORGANIZATION_EMAIL_VERIFY_DUPLICATED })
        );
      return;
    }
    // 소속되어 있지 않고 이메일을 보낸 적도 없을 경우
    if (!verify) {
      await addOrganizationEmailVerify(
        organizationsEmailRequestBody.userId,
        organizationsEmailRequestBody.email,
        organizationsEmailRequestBody.organizationId
      );
    }
    // 이메일을 보낸 적이 있으나 다른 이메일 인 경우
    else if (verify.email !== email) {
      await updateOrganizationEmailVerify(
        organizationsEmailRequestBody.userId,
        organizationsEmailRequestBody.email,
        organizationsEmailRequestBody.organizationId
      );
    }

    if (
      !(await sendSecretMail(
        email,
        userId,
        userName,
        organizationId,
        organizationName
      ))
    ) {
      throw ORGANIZATIONS_EMAIL_SEND_FAIL;
    }

    res.status(201).json(
      new ResponseBody({
        message: ORGANIZATIONS_EMAIL_SEND_SUCCESS,
      })
    );
  } catch (e) {
    if (typeof e === "string") {
      res.status(400).send(new ResponseBody({ message: e }));
      return;
    }
    if (
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

export const getBelongOrganizations = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const { userId } = req.query;
  try {
    if (typeof userId !== "string") throw REQUEST_QUERY_ERROR;
    const organizationsGetBody = new UidValidationRequestBody(userId);
    const result = await findBelongOrganizations(organizationsGetBody.userId);
    res.status(201).json(
      new ResponseBody({
        data: result,
        message: BELONG_ORGANIZATIONS_GET_SUCCESS,
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
