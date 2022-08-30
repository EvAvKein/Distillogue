import {lookupInOptional} from "../helpers/lookupInOptional.js";
import {editableUserData} from "./user.js";
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

class UserPatchRequest {
  dataName:editableUserData;
  newValue:any;

  constructor(dataName:UserPatchRequest["dataName"], newValue:UserPatchRequest["newValue"]) {
    this.dataName = dataName;
    this.newValue = newValue;
  };
};

class NodeCreationRequest {
  invitedOwnerIds:string[]|undefined;
  title:string;
  body:string;
  deletedDraftIndex?:number;
  config?:PostConfig;
  nodePath?:Node["id"][];

  constructor(invitedOwnerIds:NodeCreationRequest["invitedOwnerIds"]|undefined, title:NodeCreationRequest["title"], body:NodeCreationRequest["body"], deletedDraftIndex?:NodeCreationRequest["deletedDraftIndex"], config?:NodeCreationRequest["config"], nodePath?:NodeCreationRequest["nodePath"]) {
    this.invitedOwnerIds = invitedOwnerIds;
    this.title = title;
    this.body = body;
    typeof deletedDraftIndex === "number" ? this.deletedDraftIndex = deletedDraftIndex : delete this.deletedDraftIndex;
    config ? this.config = config : delete this.config;
    nodePath ? this.nodePath = nodePath : delete this.nodePath;
  };
};

class NodeInteractionRequest {
  nodePath:Node["id"][];
  interactionType:"vote"|"reply";
  interactionData:{
    voteDirection:"up"|"down",
    newVoteStatus:boolean,
  }|{
    nodeReplyRequest:NodeCreationRequest,
  };

  constructor(nodePath:NodeInteractionRequest["nodePath"], interactionType:NodeInteractionRequest["interactionType"], interactionData:NodeInteractionRequest["interactionData"]) {
    this.nodePath = nodePath;
    this.interactionType = interactionType;
    this.interactionData = interactionData;
  };
};

export {
  FetchResponse,
  UserPatchRequest,
  NodeCreationRequest,
  NodeInteractionRequest,
};