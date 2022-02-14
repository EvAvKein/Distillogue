import {v4 as uuidV4} from "uuid";

function newUserId():string {
  return uuidV4();
};

export {
  newUserId,
};