import { NextApiRequest, NextApiResponse } from "next";
import { ResponseBody } from "@/models/common/ResponseBody";
import { SERVER_INTERNAL_ERROR_MESSAGE } from "@/constants/message";
import {
  findOrganizations,
  separateOrganizationsRequests,
} from "@/repository/organization.repository";
import { ORGANIZATIONS_GET_SUCCESS } from "@/constants/organizationMessage";

export const getOrganizations = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const organizationsGetBody = separateOrganizationsRequests(req.query);
    const result = await findOrganizations(organizationsGetBody);
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
