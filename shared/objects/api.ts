import {UserData, editableUserData} from "./user.js";
import {Node, PostAccess, PostConfig} from "./post.js";

export class FetchResponse<T = unknown> {
	data?: T;
	error?: {
		message: string;
	};

	constructor(data?: T, error?: FetchResponse["error"]) {
		data ? (this.data = data) : delete this.data;
		error ? (this.error = error) : delete this.error;
	}
}

export class UserCreationRequest {
	username: UserData["name"];

	constructor(username: UserCreationRequest["username"]) {
		this.username = username;
	}
}

export class UserPatchRequest<dataType extends editableUserData> {
	dataName: dataType;
	newValue: UserData[dataType];

	constructor(dataName: UserPatchRequest<dataType>["dataName"], newValue: UserPatchRequest<dataType>["newValue"]) {
		this.dataName = dataName;
		this.newValue = newValue;
	}
}

export class NodeCreationRequest {
	title: string;
	body: string;
	deletedDraftIndex?: number;

	constructor(
		title: NodeCreationRequest["title"],
		body: NodeCreationRequest["body"],
		deletedDraftIndex?: NodeCreationRequest["deletedDraftIndex"]
	) {
		this.title = title;
		this.body = body;
		typeof deletedDraftIndex === "number"
			? (this.deletedDraftIndex = deletedDraftIndex)
			: delete this.deletedDraftIndex;
	}
}

export class PostCreationRequest {
	rootNode: NodeCreationRequest;
	config: PostConfig;
	access: PostAccess;

	constructor(
		rootNode: PostCreationRequest["rootNode"],
		config: PostCreationRequest["config"],
		access: PostCreationRequest["access"]
	) {
		this.rootNode = rootNode;
		this.config = config;
		this.access = access;
	}
}

export class PostPatchRequest {
	// may include config patching tin future (for very particular properties)
	access: PostAccess;

	constructor(access: PostCreationRequest["access"]) {
		this.access = access;
	}
}

export const arrOfInteractionTypes = ["reply", "vote"] as const;
export type interactionType = (typeof arrOfInteractionTypes)[number];

export class NodeInteractionRequest {
	nodePath: Node["id"][];
	interactionType: interactionType;
	interactionData:
		| NodeCreationRequest
		| {
				voteDirection: "up" | "down";
				newVoteStatus: boolean;
		  };

	constructor(
		nodePath: NodeInteractionRequest["nodePath"],
		interactionType: NodeInteractionRequest["interactionType"],
		interactionData: NodeInteractionRequest["interactionData"]
	) {
		this.nodePath = nodePath;
		this.interactionType = interactionType;
		this.interactionData = interactionData;
	}
}
