import {users} from "../mongo.js";
import {UserData} from "../../objects";
import {Request} from "express";

export async function userIdByAuthHeader(ApiRequest:Request) {
  const authKey = ApiRequest.headers.authorization?.replace("Bearer ", "");

  if (!authKey) return null;

  const user = await users.findOne<{data:{id:UserData["id"]}}|null>(
    {"data.authKey": authKey},
    {projection: {"data.id": 1}}
  )

  return user;
};