import type {Collection, Document, UpdateOptions} from "mongodb";
import type {DeepPartial} from "../deepPartial";

export function mongoInsertIfDoesntExist<dbT extends Document>(
	collection: Collection<dbT>,
	object: dbT,
	existenceFilter: DeepPartial<dbT>,
	extraUpdateOptions?: UpdateOptions
) {
	return collection.updateOne(existenceFilter, {$setOnInsert: object}, {upsert: true, ...extraUpdateOptions});
}
