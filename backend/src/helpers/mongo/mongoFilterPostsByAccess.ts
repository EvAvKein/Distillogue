import {UserData} from "../../../objects/user";
import {Post} from "../../../objects/post";
import {Filter} from "mongodb";

export function mongoFilterPostsByAccess(userId: UserData["id"] | null | undefined, mongoFilterObject?: Filter<Post>) {
	return {
		$and: [{$or: [{"access.public": true}, {"access.users.id": userId}]}, mongoFilterObject ?? {}],
	};
}

// regarding why it causes type errors: https://github.com/mongodb/node-mongodb-native/blob/HEAD/etc/notes/CHANGES_5.0.0.md#dot-notation-typescript-support-removed-by-default
// TODO: look for workaround
