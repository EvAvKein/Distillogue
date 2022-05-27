import {lookupInOptional} from "./helpers/lookupInOptional.js";
import {v4 as newId} from "uuid";
import {unix as unixStamp} from "./helpers/timestamps.js"

class FetchResponse {
  data:null|object|any[]|true;
  error?:{
    message:string;
  };

  constructor(data:FetchResponse["data"], errorMessage?:lookupInOptional<FetchResponse["error"], "message">) {
    this.data = data;
    errorMessage ? this.error = {message: errorMessage} : delete this.error;
  };
};

class UserData {
  id:string;
  autoSignInKey:string;
  name:string;
  about:string;
  settings?:object;

  constructor(name:UserData["name"]) {
    this.id = newId();
    this.autoSignInKey = newId();
    this.name = name;
    this.about = "Hello, I haven't wrote my About yet!";
    delete this.settings;
  };
};

const arrOfEditableUserData = ["name", "about", "settings"] as const;
type editableUserData = typeof arrOfEditableUserData[number];

class User {
  data:UserData;
  banned?:true;

  constructor(data:UserData){
    this.data = data;
    delete this.banned;
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
    extraData ? this.extraData = extraData : delete this.extraData;
  };
};

class PostConfig {
  public?:true;
  lastInteracted?:true;
  votes?:{
    up?:true,
    down?:true,
    anon?:true,
  };
};

class NodeStats {
  lastInteracted?:number;
  votes?:{
    up?:UserData["id"][],
    down?:UserData["id"][],
    anon?:true,
  };;

  constructor(config?:PostConfig) {
    config?.lastInteracted ? this.lastInteracted = unixStamp() : delete this.lastInteracted;
    config?.votes ? this.votes = {
      up: config.votes.up ? [] as UserData["id"][] : undefined,
      down: config.votes.down ? [] as UserData["id"][] : undefined
    } : delete config?.votes;
  };
};

class NodeCreationRequest {
  ownerIds:string[];
  title:string;
  body:string;
  config?:PostConfig;
  nodePath?:Node["id"][];

  constructor(ownerIds:NodeCreationRequest["ownerIds"], title:NodeCreationRequest["title"], body:NodeCreationRequest["body"], config?:NodeCreationRequest["config"], nodePath?:NodeCreationRequest["nodePath"]) {
    this.ownerIds = ownerIds;
    this.title = title;
    this.body = body;
    config ? this.config = config : delete this.config;
    nodePath ? this.nodePath = nodePath : delete this.nodePath;
  };
};

class Node extends NodeCreationRequest {
  id:string;
  replies:Node[];
  stats:NodeStats;
  locked?:true;
  past?:{title:Node["title"], body:Node["body"]}[];
  
  constructor(request:NodeCreationRequest) {
    super(request.ownerIds, request.title, request.body, request.config);
    this.id = newId();
    this.replies = [];
    this.stats = new NodeStats(request.config);
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
  public:PostConfig["public"];

  constructor(post:Node) {
    super(post);
    this.public = post.config?.public;
  };
};

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