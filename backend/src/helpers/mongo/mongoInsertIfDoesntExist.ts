import {Collection, Document} from "mongodb";

export function mongoInsertIfDoesntExist(collection:Collection<any>, object:Document, existenceFilter:{}, extraUpdateOptions?:{}) {
  return collection.updateOne(
    existenceFilter,
    {$setOnInsert: object},
    {upsert: true, ...extraUpdateOptions}
  );
};