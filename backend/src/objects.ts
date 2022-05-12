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

class PostConfig {
  public?:true;
  lastActive?:true;
  votes?:{
    up?:true,
    down?:true,
    anon?:true,
  };
};

class NodeStats {
  lastActiveUnix?:number;
  votes?:{
    up?:UserData["id"][],
    down?:UserData["id"][],
    anon?:true,
  };;

  constructor(config?:PostConfig) {
    this.lastActiveUnix = config?.lastActive ? unixStamp() : undefined;
    this.votes = config?.votes ? {
      up: config.votes.up ? [] as UserData["id"][] : undefined,
      down: config.votes.down ? [] as UserData["id"][] : undefined
    } : undefined;
  };
};

class NodeCreationRequest {
  nodePath:Node["id"][]|null;
  ownerIds:string[];
  title:string;
  body:string;
  config?:PostConfig;

  constructor(nodePath:NodeCreationRequest["nodePath"], ownerIds:NodeCreationRequest["ownerIds"], title:NodeCreationRequest["title"], body:NodeCreationRequest["body"], config?:NodeCreationRequest["config"]) {
    this.nodePath = nodePath;
    this.ownerIds = ownerIds;
    this.title = title;
    this.body = body;
    this.config = config;
  };
};

class Node extends NodeCreationRequest {
  id:string;
  locked?:true;
  replies:Node[];
  past?:{title:Node["title"], body:Node["body"]}[];
  stats:NodeStats;
  config?:PostConfig;
  
  constructor(request:NodeCreationRequest) {
    super(null, request.ownerIds, request.title, request.body);
    this.id = newId("node");
    this.replies = [];
    this.stats = new NodeStats(request.config);
    this.config = request.nodePath ? undefined : request.config;
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
  public:PostConfig["public"];

  constructor(post:Node) {
    super(post);
    this.public = post.config?.public;
  }
}

class NodeInteractionRequest {
  userId:UserData["id"];
  nodePath:Node["id"][];
  interactionType:"vote"|"reply";
  interactionData:{
    voteDirection:"up"|"down",
    newVoteStatus:boolean,
  }|{
    nodeReplyRequest:NodeCreationRequest,
  };

  constructor(userId:NodeInteractionRequest["userId"], nodePath:NodeInteractionRequest["nodePath"], interactionType:NodeInteractionRequest["interactionType"], interactionData:NodeInteractionRequest["interactionData"]) {
    this.userId = userId;
    this.nodePath = nodePath;
    this.interactionType = interactionType;
    this.interactionData = interactionData;
  };
};

export {
  FetchResponse,
  User,
  UserData, editableUserData, arrOfEditableUserData,
  Log,
  PostConfig,
  PostSummary,
  NodeStats,
  NodeCreationRequest,
  Node,
  NodeSummary,
  NodeInteractionRequest,
};