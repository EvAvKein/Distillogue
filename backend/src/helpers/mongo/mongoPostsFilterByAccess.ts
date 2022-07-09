import {Node, UserData} from "../../../../shared/objects";
import {Filter} from "mongodb";

export function mongoPostsFilterByAccess(userId:UserData["id"]|null|undefined, mongoFilterObject?:Filter<Node>) {
  return {$and: [
    mongoFilterObject ?? {},
    userId
      ? {$or: [{"config.access.public": true}, {ownerIds: userId}]}
      : {"config.access.public": true}
  ]};
};