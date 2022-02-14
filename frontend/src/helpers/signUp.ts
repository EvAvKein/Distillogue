import {jsonFetch} from "./jsonFetch";
import {FetchResponse, UserData} from "../../../backend/src/objects.js";
import {useUser} from "../stores/user";

export async function signUp(username:UserData["name"]) {
  const signUpResponse = await jsonFetch("/signUp", {
    username: username,
  }).catch(() => {
    return new FetchResponse(null, "Failed to contact server");
  });

  if (signUpResponse.error) {
    return signUpResponse;
  };

  const user = useUser();
  user.data = signUpResponse.data as UserData;
  return new FetchResponse(true);
};
