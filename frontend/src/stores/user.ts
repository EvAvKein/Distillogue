import {defineStore} from "pinia";
import {User} from "../../../shared/objects/user";

export const useUser = defineStore("user", {
  state: () => {
    return {data: {}} as User;
  },
});