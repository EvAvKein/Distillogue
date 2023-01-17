import {v4 as newId} from "uuid";
import {PostConfig, Node} from "./post.js";

class User {
	auths: UserAuth[];
	sessions: UserSession[];
	banned?: true;
	data: UserData;

	constructor(data: UserData) {
		this.auths = [];
		this.sessions = [new UserSession()];
		delete this.banned;
		this.data = data;
	}
}

class UserAuth {
	provider: "Distillogue";
	key: string;

	constructor(provider: UserAuth["provider"], key: UserAuth["key"]) {
		this.provider = provider;
		this.key = key;
	}
}

class UserSession {
	name?: string;
	key: string;

	constructor(name?: UserSession["name"]) {
		name ? (this.name = name) : delete this.name;
		this.key = newId() + newId() + newId();
	}
}

class UserData {
	id: string;
	name: string;
	drafts: {title: Node["title"]; body: Node["body"]; lastEdited: number}[];
	configPresets: {name: string; config: Omit<PostConfig, "access">}[];
	contacts: {id: UserData["id"]; name: UserData["name"]}[];

	constructor(name: UserData["name"]) {
		this.id = newId();
		this.name = name;
		this.drafts = [];
		this.configPresets = [];
		this.contacts = [];
	}
}

class UserPayload {
	sessionKey: UserSession["key"];
	data: UserData;

	constructor(sessionKey: UserPayload["sessionKey"], userData: UserPayload["data"]) {
		this.sessionKey = sessionKey;
		this.data = userData;
	}
}

const arrOfEditableUserData = ["name", "drafts", "configPresets", "contacts"] as const;
type editableUserData = (typeof arrOfEditableUserData)[number];

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

export {
	User,
	UserAuth,
	UserSession,
	UserData,
	UserPayload,
	editableUserData,
	arrOfEditableUserData,
	//Log,
};
