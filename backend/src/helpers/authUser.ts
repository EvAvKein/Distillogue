import {Request} from "express";
import {sessionKey} from "./reqHeaders.js";
import {users} from "../mongo.js";

export async function authUser(apiRequest: Request) {
	const authKey = sessionKey(apiRequest);

	return authKey ? await users.findOne({sessions: {key: authKey}}) : null;
}
