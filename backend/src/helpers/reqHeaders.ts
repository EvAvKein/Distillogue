import {Request} from "express";
import {users} from "../mongo.js";

export function sessionKey(apiRequest: Request) {
	return apiRequest.headers.authorization?.replace("Bearer ", "") || "";
}

export async function userBySession(apiRequest: Request) {
	const authKey = sessionKey(apiRequest);

	if (!authKey) return null;

	const user = await users.findOne({sessions: {key: authKey}});

	return user;
}
