import {UserData} from "../../../objects/user";
import {Node} from "../../../objects/post";
import {Filter} from "mongodb";

export function mongoFilterPostsByAccess(userId: UserData["id"] | null | undefined, mongoFilterObject?: Filter<Node>) {
	return {
		$and: [
			mongoFilterObject ?? {},
			userId ? {$or: [{"config.access.public": true}, {ownerIds: userId}]} : {"config.access.public": true},
		],
	};
}
