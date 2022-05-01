import {jsonFetch} from "./jsonFetch";
import {FetchResponse, UserData} from "../../../backend/src/objects";
import {useUser} from "../stores/user";

export async function userEntry(entryType:"signIn"|"signUp", username:UserData["name"]) {
  const entryResponse = await jsonFetch("/" + entryType, {
    username: username,
  }).catch(() => {
    return new FetchResponse(null, "Failed to contact server");
  });

  if (entryResponse.error) {
    return entryResponse;
  };

  const user = useUser();
  user.data = entryResponse.data as UserData;
  return new FetchResponse(true);
};
