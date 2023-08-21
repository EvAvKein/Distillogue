import {Request} from "express";
import {sessionKey} from "./reqHeaders.js";
import {users} from "../mongo.js";
import {unix} from "../../../shared/helpers/timestamps.js";

export async function authUser(apiRequest: Request) {
	const authKey = sessionKey(apiRequest);

	return authKey
		? (
				await users.findOneAndUpdate(
					{"sessions.key": authKey},
					{$set: {"sessions.$.latestUsed": unix()}},
					{returnDocument: "after"}
				)
		  ).value
		: null;
}
