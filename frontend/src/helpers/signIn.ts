import {jsonFetch} from "./jsonFetch";
import {FetchResponse, UserData} from "../../../backend/src/objects.js";
import {useUser} from "../stores/user";

export async function signIn(username:UserData["name"]) {
  const signInResponse = await jsonFetch("/signIn", {
    username: username,
  }).catch(() => {
    return new FetchResponse(null, "Failed to contact server");
  });

  if (signInResponse.error) {
    return signInResponse;
  };

  const user = useUser();
  user.data = signInResponse.data as UserData;
  return new FetchResponse(true);
};
