import {v4 as newId} from "uuid";
import {unix as unixStamp} from "../helpers/timestamps.js";
import {NodeCreationRequest} from "./api.js";
import {UserData} from "./user.js";

class PostConfig {
  access?: {
    public?:true;
  };
  timestamps?: {
    posted?:true,
    interacted?:true,
  };
  votes?:{
    up?:true,
    down?:true,
    anon?:true,
  };
};

class NodeStats {
  timestamps: {
    posted:number,
    interacted?:number,
  };
  votes?:{
    up?:UserData["id"][],
    down?:UserData["id"][],
    anon?:true,
  };

  constructor(config:PostConfig) {
    this.timestamps = {posted: unixStamp()};
      delete this.timestamps.interacted;
    config.votes ? this.votes = {} : delete this.votes;
      config.votes?.up ? this.votes!.up = [] : delete this.votes?.up;
      config.votes?.down ? this.votes!.down = [] : delete this.votes?.down;
  };
};

class Node extends NodeCreationRequest {
  ownerIds:UserData["id"][];
  id:string;
  replies:Node[];
  stats:NodeStats;
  locked?:true;
  past?:{title:Node["title"], body:Node["body"]}[];
  
  constructor(ownerId:UserData["id"], request:NodeCreationRequest) {
    super(undefined, request.title, request.body, undefined, request.config);
    this.ownerIds = [ownerId].concat(request.invitedOwnerIds || []);
    this.id = newId();
    this.replies = [];
    this.stats = new NodeStats(request.config || {});
    request.config ? this.config = request.config : delete this.config;
    delete this.locked;
    delete this.past;
  };
};

class NodeSummary {
  id:Node["id"];
  ownerIds:Node["ownerIds"];
  title:Node["title"];
  locked:Node["locked"];
  stats:NodeStats;

  constructor(node:Node) {
    this.id = node.id;
    this.ownerIds = node.ownerIds;
    this.title = node.title;
    this.locked = node.locked;
    this.stats = node.stats;
  };
};

class PostSummary extends NodeSummary {
  access:PostConfig["access"];

  constructor(post:Node) {
    super(post);
    post.config?.access ? this.access = post.config?.access : delete this.access;
  };
};

export {
  PostConfig,
  NodeStats,
  Node,
  NodeSummary,
  PostSummary,
};