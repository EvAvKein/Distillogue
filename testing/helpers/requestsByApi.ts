import {type APIRequestContext, type Page} from "@playwright/test";
import {randomUsername} from "./randomAlphanumString.js";
import {setSessionKey} from "./sessionKey.js";
import {FetchResponse, NodeInteractionRequest, PostCreationRequest} from "../../shared/objects/api.js";
import {UserData, UserPayload, UserSession} from "../../shared/objects/user.js";
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
export async function getSessions(request: Request, authKey: string) {
	return (
		await request.get("/api/sessions", {
			headers: {authorization: "Bearer " + authKey},
		})
	).json() as FetchResponse<UserSession[]>;
}
export async function deleteSession(request: Request, authKey: string, otherSessionForDeletion?: {key: string}) {
	return request.delete("/api/sessions", {
		headers: {authorization: "Bearer " + authKey},
		data: otherSessionForDeletion,
	});
}

export async function getUserData(request: Request, authKey: string) {
	return (
		await request.get("/api/users", {
			headers: {authorization: "Bearer " + authKey},
		})
	).json() as FetchResponse<UserData>;
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

export async function getPost(request: Request, authKey: string, postId: string) {
	return (
		await request.get("/api/posts/" + postId, {
			headers: {authorization: "Bearer " + authKey},
		})
	).json() as FetchResponse<Post>;
}

export async function nodeInteraction(request: Request, authKey: string, interactionRequest: NodeInteractionRequest) {
	const response = await request.post("/api/posts/interactions", {
		headers: {authorization: "Bearer " + authKey},
		data: interactionRequest,
	});

	return response.ok() ? new FetchResponse<void>() : ((await response.json()) as FetchResponse<void>);
}
