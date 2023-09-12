import {v4 as newId} from "uuid";
import {PostConfig, Node} from "./post.js";
import {unix} from "../helpers/timestamps.js";

export class User {
	auths: UserAuth[];
	sessions: UserSession[];
	data: UserData;

	constructor(data: UserData) {
		this.auths = [];
		this.sessions = [new UserSession("Session 1")];
		this.data = data;
	}
}

export class UserAuth {
	provider: "Distillogue";
	key: string;

	constructor(provider: UserAuth["provider"], key: UserAuth["key"]) {
		this.provider = provider;
		this.key = key;
	}
}

export class UserSession {
	name: string;
	key: string;
	latestUsed: number;

	constructor(name: UserSession["name"]) {
		this.name = name;
		this.key = newId() + newId() + newId();
		this.latestUsed = unix();
	}
}

export class AdminEntry {
	id: UserData["id"];
	name: string;
	joined: number;

	constructor(id: AdminEntry["id"], name: AdminEntry["name"]) {
		this.id = id;
		this.name = name;
		this.joined = unix();
	}
}

export class UserData {
	id: string;
	permissions: {banned?: true; admin?: true};
	name: string;
	drafts: {title: Node["title"]; body: Node["body"]; lastEdited: number}[];
	presets: {name: string; config: PostConfig}[];
	contacts: {id: UserData["id"]; name: UserData["name"]}[];

	constructor(name: UserData["name"]) {
		this.id = newId();
		this.permissions = {};
		this.name = name;
		this.drafts = [];
		this.presets = [];
		this.contacts = [];
	}
}

export class UserPayload {
	sessionKey: UserSession["key"];
	data: UserData;

	constructor(sessionKey: UserPayload["sessionKey"], userData: UserPayload["data"]) {
		this.sessionKey = sessionKey;
		this.data = userData;
	}
}

export const arrOfEditableUserData = ["name", "drafts", "presets", "contacts"] as const;
export type editableUserData = (typeof arrOfEditableUserData)[number];

export class UserEntry {
	name: string;
	id: UserData["id"];

	constructor(name: UserEntry["name"], id: UserEntry["id"]) {
		this.name = name;
		this.id = id;
	}
}

export const arrOfPostUserRoles = ["Moderator", "Spectator"] as const;
export type PostUserRole = (typeof arrOfPostUserRoles)[number];

export class PostUserEntry extends UserEntry {
	roles: PostUserRole[];

	constructor(name: UserEntry["name"], id: UserEntry["id"], roles?: PostUserEntry["roles"]) {
		super(name, id);
		this.roles = roles ?? [];
	}
}

// class Log {
//   timeUnix:number;
//   userId:UserData["id"];
//   targetId:UserData["id"]|Node["id"];
//   category:"added"|"removed"|"edited";
//   extraData?:object|string|number;

//   constructor(timeUnix:Log["timeUnix"], userId:Log["userId"], targetId:Log["targetId"], category:Log["category"], extraData?:Log["extraData"]) {
//     this.timeUnix = timeUnix;
//     this.userId = userId;
//     this.targetId = targetId;
//     this.category = category;
//     extraData ? this.extraData = extraData : delete this.extraData;
//   };
// };
