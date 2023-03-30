import {Collection, Document} from "mongodb";
import {DeepPartial} from "../deepPartial";

export function mongoInsertIfDoesntExist<dbT extends Document>(
	collection: Collection<dbT>,
	object: dbT,
	existenceFilter: DeepPartial<dbT>,
	extraUpdateOptions?: {}
) {
	return collection.updateOne(existenceFilter, {$setOnInsert: object}, {upsert: true, ...extraUpdateOptions});
}
