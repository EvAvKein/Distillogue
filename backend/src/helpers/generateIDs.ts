import {v4 as uuidV4} from "uuid";

import {users} from "../mongo.js";
async function newUserId():Promise<string> {
  const generatedId = uuidV4().slice(0, 13);
  const idExists = await users.findOne({"id": generatedId}).catch((error) => {console.log(error)});
  return idExists ? newUserId() : generatedId;
};

export {
  newUserId,
};