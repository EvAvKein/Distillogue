import {UserData} from "../../../objects/user";
import {Post} from "../../../objects/post";
import {Filter} from "mongodb";

export function mongoFilterPostsByAccess(userData: UserData | null | undefined, mongoFilterObject?: Filter<Post>) {
	const permissionsFilter = userData?.permissions.admin
		? {} // might in future be narrowed to posts that were reported, if userbase prefers (and laws permit)
		: {$or: [{"access.public": true}, {"access.users.id": userData?.id}]};

	return {
		$and: [permissionsFilter, mongoFilterObject ?? {}],
	};
}
