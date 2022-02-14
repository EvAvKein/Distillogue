import {lookupInOptional} from "./helpers/lookupInOptional.js";
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

import {newUserId} from "./helpers/generateIDs.js";
class UserData {
  id:string;
  name:string;
  about?:string;
  settings?:object;

  constructor(name:UserData["name"]) {
    this.id = newUserId();
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

class Post {
  title:string;
  body:string;
  lastActiveUnix:number;

  constructor(title:Post["title"], body:Post["body"], lastActiveUnix:Post["lastActiveUnix"]){
    this.title = title;
    this.body = body;
    this.lastActiveUnix = lastActiveUnix;
  };
};


export {
  FetchResponse,
  User,
  UserData, editableUserData, arrOfEditableUserData,
  Post,
};