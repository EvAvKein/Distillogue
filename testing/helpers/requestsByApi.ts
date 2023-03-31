import {type APIRequestContext, type Page, expect} from "@playwright/test";
import {randomUsername} from "./randomAlphanumString.js";
import {setSessionKey} from "./sessionKey.js";
import {NodeCreationRequest} from "../../shared/objects/api.js";
import {UserPayload} from "../../shared/objects/user.js";
type Request = APIRequestContext;

async function createUser(request: Request, name?: string) {
	return request.post("/api/users", {data: {username: name ?? randomUsername()}});
}
async function createSession(request: Request, name: string) {
	return request.post("/api/sessions", {data: {username: name}});
}
async function getSession(request: Request, authKey: string) {
	return request.get("/api/sessions", {
		headers: {authorization: "Bearer" + authKey},
	});
}
async function deleteSession(request: Request, authKey: string) {
	return request.delete("/api/sessions", {
		headers: {authorization: "Bearer " + authKey},
	});
}

async function createUserAndSession(request: Request) {
	const name = randomUsername();

	const userCreationResponse = await createUser(request, name);
	expect(userCreationResponse.ok()).toBeTruthy();

	const sessionCreationResponse = await createSession(request, name);
	expect(sessionCreationResponse.ok()).toBeTruthy();

	const user = (await sessionCreationResponse.json())?.data as UserPayload;
	expect(typeof user.sessionKey).toBe("string");

	return user;
}

async function signUp(request: Request, page: Page) {
	const data = await createUserAndSession(request);
	await page.goto("/");
	await setSessionKey(page, data.sessionKey);

	return data;
}

async function createPost(request: Request, authKey: string, postRequest: NodeCreationRequest) {
	return request.post("/api/posts", {
		headers: {authorization: "Bearer " + authKey},
		data: postRequest,
	});
}

export {createUser, createSession, getSession, deleteSession, createUserAndSession, signUp, createPost};
