import {users} from "../mongo.js";
import {Request} from "express";

export async function userIdByAuthHeader(ApiRequest:Request) {
  const authKey = ApiRequest.headers.authorization?.replace("Bearer ", "");

  if (!authKey) return null;

  const user = await users.findOne({"data.authKey": authKey});

  return user;
};