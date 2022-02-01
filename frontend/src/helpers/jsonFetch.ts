export default async function jsonFetch(fetchAddress:string, bodyObject:Object) {
  return await fetch(fetchAddress, {
    headers: {"Content-Type": "application/json"},
    method: "POST",
    body: JSON.stringify(bodyObject),
  }).then(async response => {
    if (!response.ok) throw response;
    const responseObject = await response.json()
    return responseObject;
  }).catch(() => {
    return false;
  });
};