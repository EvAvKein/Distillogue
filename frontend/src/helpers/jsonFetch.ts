import {FetchResponse} from "../../../backend/src/objects";

export async function jsonFetch(fetchAddress:string, bodyObject:object) {
  return await fetch(fetchAddress, {
    headers: {"Content-Type": "application/json"},
    method: "POST",
    body: JSON.stringify(bodyObject),
  }).then(async response => {
    if (!response.ok) throw response;
    const responseObject = await response.json() as FetchResponse;
    return responseObject;
  }).catch(() => {
    return new FetchResponse(null, "Failed to contact server");
  });
};