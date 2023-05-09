import {type APIRequestContext, type Page, expect} from "@playwright/test";
import {randomUsername} from "./randomAlphanumString.js";
import {getSessionKey, setSessionKey} from "./sessionKey.js";
import {FetchResponse, PostCreationRequest} from "../../shared/objects/api.js";
import {UserData, UserPayload} from "../../shared/objects/user.js";
type Request = APIRequestContext;

export async function createUser(request: Request, name?: string) {
	return request.post("/api/users", {data: {username: name ?? randomUsername()}});
}
export async function createSession(request: Request, name: string) {
	return request.post("/api/sessions", {data: {username: name}});
}
export async function getSession(request: Request, authKey: string) {
	return request.get("/api/sessions", {
		headers: {authorization: "Bearer " + authKey},
	});
}
export async function deleteSession(request: Request, authKey: string) {
	return request.delete("/api/sessions", {
		headers: {authorization: "Bearer " + authKey},
	});
}

export async function getUserData(request: Request, page: Page) {
	const response = await getSession(request, (await getSessionKey(page)) ?? "");
	await expect(response).toBeOK();
	return (await response.json()) as FetchResponse<UserData>;
}

export async function createUserAndSession(request: Request) {
	const name = randomUsername();

	const userCreationResponse = await createUser(request, name);
	expect(userCreationResponse).toBeOK();

	const sessionCreationResponse = await createSession(request, name);
	expect(sessionCreationResponse).toBeOK();

	const user = (await sessionCreationResponse.json())?.data as UserPayload;
	expect(typeof user.sessionKey).toBe("string");

	return user;
}

export async function signUp(request: Request, page: Page) {
	const data = await createUserAndSession(request);
	await page.goto("/");
	await setSessionKey(page, data.sessionKey);

	return data;
}

export async function setAdmin(request: Request, authKey: string, newAdminStatus: boolean) {
	return newAdminStatus
		? request.post("/api/tests/admin", {
				headers: {authorization: "Bearer " + authKey},
		  })
		: request.delete("/api/tests/admin", {
				headers: {authorization: "Bearer " + authKey},
		  });
}

export async function createPost(request: Request, authKey: string, postRequest: PostCreationRequest) {
	return request.post("/api/posts", {
		headers: {authorization: "Bearer " + authKey},
		data: postRequest,
	});
}
