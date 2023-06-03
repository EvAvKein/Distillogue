import {v4 as newId} from "uuid";
import {unix as unixStamp} from "../helpers/timestamps.js";
import {NodeCreationRequest} from "./api.js";
import {UserData, PostUserEntry} from "./user.js";

export interface PostConfig {
	timestamps?: {
		interacted?: true;
	};
	votes?: {
		up?: true;
		down?: true;
		anon?: true;
	};
}

export class NodeStats {
	timestamps: {
		posted: number;
		interacted?: number;
	};
	votes?: {
		up?: UserData["id"][];
		down?: UserData["id"][];
		anon?: true;
	};

	constructor(config: PostConfig) {
		this.timestamps = {posted: unixStamp()};
		delete this.timestamps.interacted;
		config.votes ? (this.votes = {}) : delete this.votes;
		config.votes?.up ? (this.votes!.up = []) : delete this.votes?.up;
		config.votes?.down ? (this.votes!.down = []) : delete this.votes?.down;
	}
}

export interface PostAccess {
	public?: true;
	users: PostUserEntry[];
}

export class Node extends NodeCreationRequest {
	ownerId: UserData["id"];
	id: string;
	stats: NodeStats;
	replies: Node[];
	locked?: true;
	past: {title: Node["title"]; body: Node["body"]}[];

	constructor(ownerId: UserData["id"], request: NodeCreationRequest, postConfig: PostConfig) {
		super(request.title, request.body, undefined);
		this.ownerId = ownerId;
		this.id = newId();
		this.stats = new NodeStats(postConfig);
		this.replies = [];
		delete this.locked;
		this.past = [];
	}
}

export class PostStats {
	posted: number;
	interacted?: number | null;

	constructor(config: PostConfig) {
		this.posted = unixStamp();
		config.timestamps?.interacted ? (this.interacted = null) : delete this.interacted;
	}
}

export class Post {
	/* using ID of root node */
	thread: Node;
	config: PostConfig;
	access: PostAccess;
	stats: PostStats;

	constructor(thread: Post["thread"], config: Post["config"], access: Post["access"]) {
		this.thread = thread;
		this.config = config;
		this.access = access;
		this.stats = new PostStats(config);
	}
}

export class PostSummary {
	id: Node["id"];
	title: Node["title"];
	config: Post["config"];
	access: Post["access"];
	stats: Post["stats"];

	constructor(post: Post) {
		this.id = post.thread.id;
		this.title = post.thread.title;
		this.config = post.config;
		this.access = post.access;
		this.stats = post.stats;
	}
}
