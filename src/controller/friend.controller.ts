import { NextApiRequest, NextApiResponse } from "next";
import { FriendPostRequestBody } from "@/models/friend/FriendPostRequestBody";
import {
  addFriend,
  approveFriendRequest,
  deleteFriendOrRequest,
  fetchFriendList,
  fetchFriendRequests,
  fetchRecommendedFriends,
  hasFriendRequest,
} from "@/repository/friend.repository";
import { ResponseBody } from "@/models/common/ResponseBody";
import {
  RECOMMENDED_FREINDS_GET_SUCCESS,
  REQUEST_QUERY_ERROR,
  SERVER_INTERNAL_ERROR_MESSAGE,
} from "@/constants/message";
import {
  APPROVE_FRIEND_REQUEST_SUCCESS,
  FRIEND_CANCEL_REQUEST_ID_ERROR,
  REFUSE_FRIEND_REQUEST_SUCCESS,
  FRIEND_REQUEST_DUPLICATED_ERROR,
  FRIEND_REQUEST_ID_ERROR,
  FRIEND_REQUEST_SUCCESS,
  FRIEND_REQUESTS_GET_SUCCESS,
  NOT_FOUND_FRIEND_REQUEST_ERROR,
  FRIEND_LIST_GET_SUCCESS,
  PAGE_NUM_OUT_OF_RANGE_ERROR,
  INVALID_FRIEND_REQUEST_USER_ID,
  ALREADY_RECEIVED_FRIEND_REQUEST,
} from "@/constants/FriendMessage";
import { Prisma } from ".prisma/client";
import PrismaClientKnownRequestError = Prisma.PrismaClientKnownRequestError;
import { FriendGetOverviewsBody } from "@/models/friend/FriendGetOverviewsBody";
import { FriendRequestsGetBody } from "@/models/friend/FriendRequestsGetBody";
import { UidValidationRequestBody } from "@/models/common/UidValidationRequestBody";

export const sendFriendRequest = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const { targetUserId } = req.body;
  const { userId } = req.query;

  try {
    if (typeof userId !== "string") {
      throw INVALID_FRIEND_REQUEST_USER_ID;
    }
    const friendRequestBody = new FriendPostRequestBody(userId, targetUserId);
    if (userId === targetUserId) {
      throw FRIEND_REQUEST_ID_ERROR;
    }
    const didReceiveRequest = await hasFriendRequest({
      acceptorId: userId,
      requesterId: targetUserId,
    });
    if (didReceiveRequest) {
      throw ALREADY_RECEIVED_FRIEND_REQUEST;
    }

    await addFriend(friendRequestBody.userId, friendRequestBody.targetUserId);
    res.status(201).send(new ResponseBody({ message: FRIEND_REQUEST_SUCCESS }));
  } catch (e) {
    if (typeof e === "string") {
      res.status(400).send(new ResponseBody({ message: e }));
      return;
    }
    //이미 해당 아이디로 친구 요청을 보낸 적이 있는 경우
    if (e instanceof PrismaClientKnownRequestError && e.code === "P2002") {
      res
        .status(409)
        .send(new ResponseBody({ message: FRIEND_REQUEST_DUPLICATED_ERROR }));
      return;
    }
    res
      .status(500)
      .send(new ResponseBody({ message: SERVER_INTERNAL_ERROR_MESSAGE }));
  }
};

export const deleteFriend = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const { userId, friendId } = req.query;
    console.log(userId, friendId);
    if (typeof userId !== "string" || typeof friendId !== "string") {
      throw REQUEST_QUERY_ERROR;
    }
    const friendRequestBody = new FriendPostRequestBody(userId, friendId);
    if (userId === friendId) {
      throw FRIEND_CANCEL_REQUEST_ID_ERROR;
    }
    await deleteFriendOrRequest(
      friendRequestBody.userId,
      friendRequestBody.targetUserId
    );
    res
      .status(201)
      .send(new ResponseBody({ message: REFUSE_FRIEND_REQUEST_SUCCESS }));
  } catch (e) {
    if (e instanceof PrismaClientKnownRequestError && e.code === "P2025") {
      res
        .status(400)
        .send(new ResponseBody({ message: NOT_FOUND_FRIEND_REQUEST_ERROR }));
      return;
    }
    if (typeof e === "string") {
      res.status(400).send(new ResponseBody({ message: e }));
      return;
    }
    res
      .status(500)
      .send(new ResponseBody({ message: SERVER_INTERNAL_ERROR_MESSAGE }));
  }
};

export const getFriendList = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const { userId, page, accepted } = req.query;
    if (
      typeof userId !== "string" ||
      (typeof accepted !== "string" && typeof accepted !== "undefined") ||
      (typeof page !== "string" && typeof page !== "undefined")
    ) {
      throw REQUEST_QUERY_ERROR;
    }
    //친구 요청 목록 조회인 경우
    if (accepted === "false") {
      const friendRequestBody = new FriendRequestsGetBody(userId, page);
      const result = await fetchFriendRequests(
        friendRequestBody.userId,
        friendRequestBody.page
      );
      console.log(result);
      res.status(200).send(
        new ResponseBody({
          data: result,
          message: FRIEND_REQUESTS_GET_SUCCESS,
        })
      );
    }
    //친구 목록 조회인 경우
    else {
      const friendRequestBody = new FriendGetOverviewsBody(userId, page);
      const result = await fetchFriendList(
        friendRequestBody.userId,
        friendRequestBody.page
      );
      if (result.friends.length === 0 && friendRequestBody.page !== 0) {
        throw PAGE_NUM_OUT_OF_RANGE_ERROR;
      }
      res.status(200).send(
        new ResponseBody({
          data: result,
          message: FRIEND_LIST_GET_SUCCESS,
        })
      );
    }
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

export const acceptFriendRequest = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const { userId, friendId } = req.query;
    if (typeof userId !== "string" || typeof friendId !== "string") {
      throw REQUEST_QUERY_ERROR;
    }
    const friendRequestBody = new FriendPostRequestBody(friendId, userId);
    await approveFriendRequest(
      friendRequestBody.userId,
      friendRequestBody.targetUserId
    );
    res.status(200).send(
      new ResponseBody({
        message: APPROVE_FRIEND_REQUEST_SUCCESS,
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

export const getRecommendedFriends = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const { userId } = req.query;
    if (typeof userId !== "string") {
      res.status(404).send(new ResponseBody({ message: REQUEST_QUERY_ERROR }));
      return;
    }
    const requestBody = new UidValidationRequestBody(userId);
    const result = await fetchRecommendedFriends(requestBody.userId);
    res.status(200).send(
      new ResponseBody({
        data: result,
        message: RECOMMENDED_FREINDS_GET_SUCCESS,
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
