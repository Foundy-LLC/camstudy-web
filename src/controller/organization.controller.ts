import { NextApiRequest, NextApiResponse } from "next";
import { ResponseBody } from "@/models/common/ResponseBody";
import {
  REQUEST_QUERY_ERROR,
  SERVER_INTERNAL_ERROR_MESSAGE,
} from "@/constants/message";
import {
  addOrganizationEmailVerify,
  deleteBelong,
  findBelongOrganizations,
  findOrganizations,
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
import { OrganizationsBelongRequestBody } from "@/models/organization/OrganizationsBelongRequestBody";
import { verifyEmailToken } from "@/service/manageVerifyToken";
import { TokenExpiredError } from "jsonwebtoken";
import { BelongOrganization } from "@/stores/OrganizationStore";
import { ValidateUid } from "@/models/common/ValidateUid";

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
    const organizationsEmailConfirmBody = new OrganizationsBelongRequestBody(
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
            "????????? ?????? ????????? ?????????????????????. ?????? ?????? ????????? ???????????????.",
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
  const { userId, organizationId, organizationName } = req.body;
  try {
    const organizationDeleteRequestBody = new OrganizationsBelongRequestBody(
      userId,
      organizationId,
      organizationName
    );
    await deleteBelong(
      organizationDeleteRequestBody.userId,
      organizationDeleteRequestBody.organizationId
    );
    res.status(201).json(
      new ResponseBody({
        message: `${organizationName}???(???) ???????????? ?????????????????????.`,
      })
    );
  } catch (e) {}
};

export const setOrganizationEmail = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const { userId, userName, email, organizationId, organizationName } =
    req.body;
  try {
    const organizationsEmailRequestBody = new OrganizationsEmailRequestBody(
      userId,
      userName,
      email,
      organizationId,
      organizationName
    );
    // ?????? ????????? ?????? ???????????? ?????? ??? ??????
    const verify = await verifyBelong(userId, organizationId);
    if (verify && verify.isAuthenticated === true) {
      res
        .status(409)
        .send(
          new ResponseBody({ message: ORGANIZATION_EMAIL_VERIFY_DUPLICATED })
        );
      return;
    }
    // ???????????? ?????? ?????? ???????????? ?????? ?????? ?????? ??????
    if (!verify) {
      await addOrganizationEmailVerify(
        organizationsEmailRequestBody.userId,
        organizationsEmailRequestBody.email,
        organizationsEmailRequestBody.organizationId
      );
    }
    // ???????????? ?????? ?????? ????????? ?????? ????????? ??? ??????
    else if (verify.email !== email) {
      await updateOrganizationEmailVerify(
        organizationsEmailRequestBody.userId,
        organizationsEmailRequestBody.email,
        organizationsEmailRequestBody.organizationId
      );
    }

    //????????? ??????
    if (
      !sendSecretMail(email, userId, userName, organizationId, organizationName)
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
          message: "?????? ?????? ???????????? ?????? ???????????? ?????????????????????",
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
    const organizationsGetBody = new ValidateUid(userId);
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
