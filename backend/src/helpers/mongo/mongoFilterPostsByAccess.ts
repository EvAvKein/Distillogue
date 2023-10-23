import {UserData} from "../../../objects/user";
import {Post} from "../../../objects/post";
import {Filter} from "mongodb";
import {type PostUserRole} from "../../../objects/user";

export function mongoFilterPostsByAccess(
	userData: UserData | null | undefined,
	mongoFilterObject?: Filter<Post>,
	roleRequired?: PostUserRole
) {
	const permissionsFilter = userData?.permissions.admin
		? {} // might in future be narrowed to posts that were reported, if userbase prefers (and laws permit)
		: roleRequired
		? {"access.users": {$elemMatch: {id: userData?.id, roles: roleRequired}}}
		: {"access.users.id": userData?.id};

	return {
		$and: [permissionsFilter, mongoFilterObject ?? {}],
	};
}
