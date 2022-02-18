import {lookupInOptional} from "./helpers/lookupInOptional.js";
import {newUserId} from "./helpers/generateIDs.js";
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
  ownerId:string;
  title:string;
  body:string;
  stats?: { // optional to allow clientside post request objects to use the class as TS type (because stats, e.g lastActiveUnix, shouldn't be sourced from client)
    lastActiveUnix:number;
  };
  settings: {
    isPublic:boolean;
  };

  constructor(ownerId:Post["ownerId"], title:Post["title"], body:Post["body"], settings:Post["settings"]){
    this.ownerId = ownerId;
    this.title = title;
    this.body = body;
    this.stats = {
      lastActiveUnix: unixStamp(),
    };
    this.settings = settings;
  };
};


export {
  FetchResponse,
  User,
  UserData, editableUserData, arrOfEditableUserData,
  Post,
};