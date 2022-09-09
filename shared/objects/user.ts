import {v4 as newId} from "uuid";
import {PostConfig, Node} from "./post.js";

class User {
  data:UserData;
  banned?:true;

  constructor(data:UserData){
    this.data = data;
    delete this.banned;
  };
};

class UserData {
  id:string;
  authKey:string;
  name:string;
  about:string;
  drafts:{title:Node["title"], body:Node["body"], lastEdited:number}[];
  configPresets:{name:string, config:Omit<PostConfig, "access">}[];

  constructor(name:UserData["name"]) {
    this.id = newId();
    this.authKey = newId();
    this.name = name;
    this.about = "Hello, I haven't wrote my About yet!";
    this.drafts = [];
    this.configPresets = [];
  };
};

const arrOfEditableUserData = ["name", "about", "drafts", "configPresets"] as const;
type editableUserData = typeof arrOfEditableUserData[number];

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

export {
  User,
  UserData,
  editableUserData, arrOfEditableUserData,
  Log,
};