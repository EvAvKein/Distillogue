import {Node, UserData} from "../../objects";
import {Filter} from "mongodb";

export function mongoPostsFilterByAccess(userId:UserData["id"]|null|undefined, mongoFilterObject?:Filter<Node>) {
  return {$and: [
    mongoFilterObject ?? {},
    userId
      ? {$or: [{"config.public": true}, {ownerIds: userId}]}
      : {"config.public": true}
  ]};
};