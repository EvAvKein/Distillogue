import {fetchResponse} from "../../../backend/src/devInterfaces";

export async function jsonFetch(fetchAddress:string, bodyObject:Object) {
  return await fetch(fetchAddress, {
    headers: {"Content-Type": "application/json"},
    method: "POST",
    body: JSON.stringify(bodyObject),
  }).then(async response => {
    if (!response.ok) throw response;
    const responseObject = await response.json() as fetchResponse;
    return responseObject as fetchResponse;
  }).catch(() => {
    return <fetchResponse>{
      error: {message: "Failed to contact server"}
    };
  });
};