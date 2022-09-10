import {lookupInOptional} from "../helpers/lookupInOptional.js";
import {UserData, editableUserData} from "./user.js";
import {Node, PostConfig} from "./post.js";

class FetchResponse {
  data:null|object|any[]|true;
  error?:{
    message:string,
  };

  constructor(data:FetchResponse["data"], errorMessage?:lookupInOptional<FetchResponse["error"], "message">) {
    this.data = data;
    errorMessage ? this.error = {message: errorMessage} : delete this.error;
  };
};

class UserCreationRequest {
  username:UserData["name"];

  constructor(username:UserCreationRequest["username"]) {
    this.username = username;
  };
};

class UserPatchRequest {
  dataName:editableUserData;
  newValue:any;

  constructor(dataName:UserPatchRequest["dataName"], newValue:UserPatchRequest["newValue"]) {
    this.dataName = dataName;
    this.newValue = newValue;
  };
};

class NodeCreationRequest {
  invitedOwnerIds?:string[];
  title:string;
  body:string;
  deletedDraftIndex?:number;
  config?:PostConfig;
  nodePath?:Node["id"][];

  constructor(invitedOwnerIds:NodeCreationRequest["invitedOwnerIds"], title:NodeCreationRequest["title"], body:NodeCreationRequest["body"], deletedDraftIndex?:NodeCreationRequest["deletedDraftIndex"], config?:NodeCreationRequest["config"], nodePath?:NodeCreationRequest["nodePath"]) {
    invitedOwnerIds ? this.invitedOwnerIds = invitedOwnerIds : delete this.invitedOwnerIds;
    this.title = title;
    this.body = body;
    typeof deletedDraftIndex === "number" ? this.deletedDraftIndex = deletedDraftIndex : delete this.deletedDraftIndex;
    config ? this.config = config : delete this.config;
    nodePath ? this.nodePath = nodePath : delete this.nodePath;
  };
};

const arrOfInteractionTypes = ["reply", "vote"] as const;
type interactionType = typeof arrOfInteractionTypes[number];

class NodeInteractionRequest {
  nodePath:Node["id"][];
  interactionType:interactionType;
  interactionData: {
    nodeReplyRequest:NodeCreationRequest,
  }|{
    voteDirection:"up"|"down",
    newVoteStatus:boolean,
  };

  constructor(nodePath:NodeInteractionRequest["nodePath"], interactionType:NodeInteractionRequest["interactionType"], interactionData:NodeInteractionRequest["interactionData"]) {
    this.nodePath = nodePath;
    this.interactionType = interactionType;
    this.interactionData = interactionData;
  };
};

export {
  FetchResponse,
  UserCreationRequest,
  UserPatchRequest,
  NodeCreationRequest,
  interactionType, arrOfInteractionTypes,
  NodeInteractionRequest,
};