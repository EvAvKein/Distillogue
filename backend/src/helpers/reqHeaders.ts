import {Request} from "express";

export function sessionKey(apiRequest: Request) {
	return apiRequest.headers.authorization?.replace("Bearer ", "") || "";
}
