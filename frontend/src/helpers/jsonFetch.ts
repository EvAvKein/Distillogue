import {FetchResponse} from "../../../shared/objects/api";

export async function jsonFetch(method:"GET"|"POST"|"PATCH"|"DELETE", address:string, body:object|null, sessionKey?:string) {
  const authHeader = sessionKey ? {Authorization: "Bearer " + sessionKey} : null;
  const requestBody = body ? {body: JSON.stringify(body)} : null;

  return await fetch("/api" + address, {
    headers: new Headers({
      "Content-Type": "application/json",
      ...authHeader // typescript doesn't like conditionally assigning the value here 
    }),
    method: method,
    ...requestBody // might as well repeat the above pattern
  }).then(async response => {
    if (!response.ok) throw response;
    const responseObject = await response.json() as FetchResponse;
    return responseObject;
  }).catch(() => {
    return new FetchResponse(null, "Failed to contact server");
  });
};