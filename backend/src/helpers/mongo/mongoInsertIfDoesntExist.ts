import type {Collection, Document, Filter, UpdateOptions} from "mongodb";

export function mongoInsertIfDoesntExist<dbT extends Document>(
	collection: Collection<dbT>,
	object: dbT,
	existenceFilter: Filter<dbT>,
	extraUpdateOptions?: Omit<UpdateOptions, "upsert">
) {
	return collection.updateOne(existenceFilter, {$setOnInsert: object}, {upsert: true, ...extraUpdateOptions});
}
