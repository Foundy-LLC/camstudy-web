import { NextApiRequest, NextApiResponse } from "next";
import { ResponseBody } from "@/models/common/ResponseBody";
import {
  REQUEST_QUERY_ERROR,
  SERVER_INTERNAL_ERROR_MESSAGE,
} from "@/constants/message";
import { findOrganizations } from "@/repository/organization.repository";
import { ORGANIZATIONS_GET_SUCCESS } from "@/constants/organizationMessage";
import { OrganizationsGetRequestBody } from "@/models/organization/OrganizationsGetRequestBody";

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
