import {Request} from "express";
import {users} from "../mongo.js";

function sessionKey(apiRequest:Request) {
  return apiRequest.headers.authorization?.replace("Bearer ", "") || "";
};

async function userBySession(apiRequest:Request) {
  const authKey = sessionKey(apiRequest);

  if (!authKey) return null;

  const user = await users.findOne({sessions: {key: authKey}});

  return user;
};

export {
  sessionKey,
  userBySession,
};