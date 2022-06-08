import {users} from "../mongo.js";
import {UserData} from "../objects.js";
import {Request} from "express";

export async function userIdByAuthHeader(ApiRequest:Request) { //key:UserData["id"]
  const authKey = ApiRequest.headers.authorization?.replace("Bearer ", "");

  if (!authKey) return null;

  const test = await users.findOne<{data:{id:UserData["id"]}}|null>(
    {"data.authKey": authKey},
    {projection: {"data.id": 1}}
  )

  return test?.data.id;
};