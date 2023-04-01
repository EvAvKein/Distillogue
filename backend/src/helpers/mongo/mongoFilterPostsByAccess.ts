import {UserData} from "../../../objects/user";
import {Post} from "../../../objects/post";
import {Filter} from "mongodb";

export function mongoFilterPostsByAccess(userId: UserData["id"] | null | undefined, mongoFilterObject?: Filter<Post>) {
	return {
		$and: [{$or: [{"access.public": true}, {"access.users": userId}]}, mongoFilterObject ?? {}],
	};
}
