import {type PlaywrightTestArgs, type APIRequestContext, expect} from "@playwright/test";
import {randomUsername} from "./randomAlphanumString.js";
import {NodeCreationRequest} from "../../shared/objects/api";
type request = PlaywrightTestArgs["request"];

async function createUser(request: request, name?: string) {
	return request.post("/api/users", {data: {username: name ?? randomUsername()}});
}
async function createSession(request: request, name: string) {
	return request.post("/api/sessions", {data: {username: name}});
}
async function getSession(request: request, authKey: string) {
	return request.get("/api/sessions", {
		headers: {authorization: "Bearer" + authKey},
	});
}
async function deleteSession(request: request, authKey: string) {
	return request.delete("/api/sessions", {
		headers: {authorization: "Bearer" + authKey},
	});
}

async function createUserAndSession(request: APIRequestContext) {
	const name = randomUsername();

	const userCreationResponse = await createUser(request, name);
	expect(userCreationResponse.ok()).toBeTruthy();

	const sessionCreationResponse = await createSession(request, name);
	expect(sessionCreationResponse.ok()).toBeTruthy();
	const sessionKey = (await sessionCreationResponse.json())?.data?.sessionKey;
	expect(typeof sessionKey).toBe("string");

	return {name: name, sessionKey: sessionKey as string};
}

async function createPost(request: request, authKey: string, postRequest: NodeCreationRequest) {
	return request.post("/api/posts", {
		headers: {authorization: "Bearer" + authKey},
		data: postRequest,
	});
}

export {createUser, createSession, getSession, deleteSession, createUserAndSession, createPost};
