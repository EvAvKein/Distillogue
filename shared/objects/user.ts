import {v4 as newId} from "uuid";
import {PostConfig, Node} from "./post.js";
import {unix} from "../helpers/timestamps.js";

export class User {
	auths: UserAuth[];
	sessions: UserSession[];
	data: UserData;

	constructor(data: UserData) {
		this.auths = [];
		this.sessions = [new UserSession()];
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
	name?: string;
	key: string;

	constructor(name?: UserSession["name"]) {
		name ? (this.name = name) : delete this.name;
		this.key = newId() + newId() + newId();
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
	permissions: {banned?: true; admin?: AdminEntry};
	name: string;
	drafts: {title: Node["title"]; body: Node["body"]; lastEdited: number}[];
	presets: {name: string; config: Omit<PostConfig, "access">}[];
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
	name: UserData["name"];
	id: UserData["id"];

	constructor(name: UserEntry["name"], id: UserEntry["id"]) {
		this.name = name;
		this.id = id;
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
