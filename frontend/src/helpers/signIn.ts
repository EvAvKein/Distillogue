import {jsonFetch} from "./jsonFetch";
import {fetchResponse} from "../../../backend/src/devInterfaces";
import {useUser} from "../stores/user";
import {userData} from "../../../backend/src/devInterfaces";

export async function signIn(username:string) {
  const signInResponse = await jsonFetch("/signIn", {
    username: username,
  }).catch(() => {
    return <fetchResponse>{error: {message: "Failed to contact server"}};
  });

  if (signInResponse.error) {
    return <fetchResponse>signInResponse;
  };

  const user = useUser();
  user.registered = true;
  user.data = signInResponse.data as userData;
  return <fetchResponse>{error: false}
};
