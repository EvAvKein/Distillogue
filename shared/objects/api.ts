import {UserData, editableUserData} from "./user.js";
import {Node, PostConfig} from "./post.js";

class FetchResponse {
	data?: unknown;
	error?: {
		message: string;
	};

	constructor(data?: FetchResponse["data"], error?: FetchResponse["error"]) {
		data ? (this.data = data) : delete this.data;
		error ? (this.error = error) : delete this.error;
	}
}

class UserCreationRequest {
	username: UserData["name"];

	constructor(username: UserCreationRequest["username"]) {
		this.username = username;
	}
}

class UserPatchRequest<dataType extends editableUserData> {
	dataName: dataType;
	newValue: UserData[dataType];

	constructor(dataName: UserPatchRequest<dataType>["dataName"], newValue: UserPatchRequest<dataType>["newValue"]) {
		this.dataName = dataName;
		this.newValue = newValue;
	}
}

class NodeCreationRequest {
	invitedOwnerIds?: string[];
	title: string;
	body: string;
	deletedDraftIndex?: number;
	config?: PostConfig;
	nodePath?: Node["id"][];

	constructor(
		invitedOwnerIds: NodeCreationRequest["invitedOwnerIds"],
		title: NodeCreationRequest["title"],
		body: NodeCreationRequest["body"],
		deletedDraftIndex?: NodeCreationRequest["deletedDraftIndex"],
		config?: NodeCreationRequest["config"],
		nodePath?: NodeCreationRequest["nodePath"]
	) {
		invitedOwnerIds ? (this.invitedOwnerIds = invitedOwnerIds) : delete this.invitedOwnerIds;
		this.title = title;
		this.body = body;
		typeof deletedDraftIndex === "number"
			? (this.deletedDraftIndex = deletedDraftIndex)
			: delete this.deletedDraftIndex;
		config ? (this.config = config) : delete this.config;
		nodePath ? (this.nodePath = nodePath) : delete this.nodePath;
	}
}

const arrOfInteractionTypes = ["reply", "vote"] as const;
type interactionType = (typeof arrOfInteractionTypes)[number];

class NodeInteractionRequest {
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

export {
	FetchResponse,
	UserCreationRequest,
	UserPatchRequest,
	NodeCreationRequest,
	interactionType,
	arrOfInteractionTypes,
	NodeInteractionRequest,
};
