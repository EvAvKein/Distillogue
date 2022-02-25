import {lookupInOptional} from "./helpers/lookupInOptional.js";
import {newId} from "./helpers/generateIDs.js";
import {unix as unixStamp} from "./helpers/timestamps.js"

class FetchResponse {
  data:null|object|any[]|true;
  error?:{
    message:string;
  };

  constructor(data:FetchResponse["data"], errorMessage?:lookupInOptional<FetchResponse["error"], "message">) {
    this.data = data;
    this.error = errorMessage ? {
      message: errorMessage,
    } : undefined;
  };
};

class UserData {
  id:string;
  name:string;
  about?:string;
  settings?:object;

  constructor(name:UserData["name"]) {
    this.id = newId("user");
    this.name = name;
    this.about = "Hello, I haven't wrote my About yet!";
    this.settings;
  };
};

type editableUserData = "name"|"about"|"settings";
const arrOfEditableUserData = ["name", "about", "settings"] as editableUserData[];

class User {
  banned?:true;
  data:UserData;

  constructor(data:UserData){
    this.data = data;
  };
};

class Log {
  timeUnix:number;
  userId:UserData["id"];
  targetId:UserData["id"]|Node["id"];
  category:"added"|"removed"|"edited";
  extraData?:object|string|number;

  constructor(timeUnix:Log["timeUnix"], userId:Log["userId"], targetId:Log["targetId"], category:Log["category"], extraData?:Log["extraData"]) {
    this.timeUnix = timeUnix;
    this.userId = userId;
    this.targetId = targetId;
    this.category = category;
    this.extraData = extraData;
  };
};

class NodeConfig {
  upvotes?:true;
  downvotes?:true;
};

class NodeStats {
  lastActiveUnix:number;
  replyCount:number;
  upvotes?:number;
  downvotes?:number;

  constructor(config?:NodeConfig) {
    this.lastActiveUnix = unixStamp();
    this.replyCount = 0;
    this.upvotes = config?.upvotes ? 0 : undefined;
    this.downvotes = config?.downvotes ? 0 : undefined;
  };
};

class NodeCreationRequest {
  parentId:string|null;
  ownerIds:string[];
  public:boolean;
  title:string;
  body:string;
  config?:NodeConfig;

  constructor(parentId:NodeCreationRequest["parentId"], ownerIds:NodeCreationRequest["ownerIds"], isPublic:NodeCreationRequest["public"], title:NodeCreationRequest["title"], body:NodeCreationRequest["body"], config?:NodeCreationRequest["config"]) {
    this.parentId = parentId;
    this.ownerIds = ownerIds;
    this.public = isPublic;
    this.title = title;
    this.body = body;
    this.config = config;
  }
};

class Node extends NodeCreationRequest {
  id:string;
  past:{titles:Node["title"][], bodies:Node["body"][]};
  locked:boolean;
  replies:Node[];
  stats:NodeStats;

  constructor(parentId:Node["parentId"], ownerIds:Node["ownerIds"], isPublic:Node["public"], title:Node["title"], body:Node["body"], config?:NodeConfig) {
    super(parentId, ownerIds, isPublic, title, body);
    this.id = newId("node");
    this.past = {titles:[], bodies: []};
    this.locked = false;
    this.replies = [];
    this.stats = new NodeStats(config);
  };

  summarize() {
    return new NodeSummary(this);
  };
};

class NodeSummary {
  id:Node["id"];
  ownerIds:Node["ownerIds"];
  public:Node["public"];
  title:Node["title"];
  locked:Node["locked"];
  stats:NodeStats;

  constructor(centralNode:Node){
    this.id = centralNode.id;
    this.ownerIds = centralNode.ownerIds;
    this.public = centralNode.public;
    this.title = centralNode.title;
    this.locked = centralNode.locked;
    this.stats = centralNode.stats;
  };
};

export {
  FetchResponse,
  User,
  UserData, editableUserData, arrOfEditableUserData,
  Log,
  NodeConfig,
  NodeStats,
  NodeCreationRequest,
  Node,
  NodeSummary,
};