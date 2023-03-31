import {type APIRequestContext, type Page, expect} from "@playwright/test";
import {randomUsername} from "./randomAlphanumString.js";
import {getSessionKey, setSessionKey} from "./sessionKey.js";
import {FetchResponse, NodeCreationRequest} from "../../shared/objects/api.js";
import {UserData, UserPayload} from "../../shared/objects/user.js";
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

async function getUserData(request: Request, page: Page) {
	const response = await getSession(request, (await getSessionKey(page)) ?? "");
	await expect(response).toBeOK();
	return (await response.json()) as FetchResponse<UserData>;
}

async function createUserAndSession(request: Request) {
	const name = randomUsername();

	const userCreationResponse = await createUser(request, name);
	expect(userCreationResponse).toBeOK();

	const sessionCreationResponse = await createSession(request, name);
	expect(sessionCreationResponse).toBeOK();

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

export {createUser, createSession, getSession, deleteSession, getUserData, createUserAndSession, signUp, createPost};
