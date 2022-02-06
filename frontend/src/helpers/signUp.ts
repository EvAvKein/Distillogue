import {jsonFetch} from "./jsonFetch";
import {fetchResponse} from "../../../backend/src/devInterfaces";
import {useUser} from "../stores/user";
import {userData} from "../../../backend/src/devInterfaces";

export async function signUp(username:string) {
  const signUpResponse = await jsonFetch("/signUp", {
    username: username,
  }).catch(() => {
    return <fetchResponse>{error: {message: "Failed to contact server"}};
  });

  if (signUpResponse.error) {
    return <fetchResponse>signUpResponse;
  };

  const user = useUser();
  user.registered = true;
  user.data = signUpResponse.data as userData;
  return <fetchResponse>{error: false}
};
