import {type APIRequestContext, type Page, expect} from "@playwright/test";
import {randomUsername} from "./randomAlphanumString.js";
import {getSessionKey, setSessionKey} from "./sessionKey.js";
import {FetchResponse, PostCreationRequest} from "../../shared/objects/api.js";
import {UserData, UserPayload} from "../../shared/objects/user.js";
import {Post} from "../../shared/objects/post.js";
type Request = APIRequestContext;

export async function createUser(request: Request, name?: string) {
	return (
		await request.post("/api/users", {data: {username: name ?? randomUsername()}})
	).json() as FetchResponse<UserPayload>;
}
export async function createSession(request: Request, name: string) {
	return (await request.post("/api/sessions", {data: {username: name}})).json() as FetchResponse<UserPayload>;
}
export async function getSession(request: Request, authKey: string) {
	return (
		await request.get("/api/sessions", {
			headers: {authorization: "Bearer " + authKey},
		})
	).json() as FetchResponse<UserData>;
}
export async function deleteSession(request: Request, authKey: string) {
	return request.delete("/api/sessions", {
		headers: {authorization: "Bearer " + authKey},
	});
}

export async function getUserData(request: Request, page: Page) {
	return getSession(request, (await getSessionKey(page)) || "");
}

export async function signUp(request: Request, page: Page) {
	const response = await createUser(request);
	await page.goto("/");
	await setSessionKey(page, response.data!.sessionKey);

	return response.data;
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
	return (
		await request.post("/api/posts", {
			headers: {authorization: "Bearer " + authKey},
			data: postRequest,
		})
	).json() as FetchResponse<Post>;
}
