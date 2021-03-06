import {defineStore} from "pinia";
import {User} from "../../../shared/objects";

export const useUser = defineStore("user", {
  state: () => {
    return {data: {}} as User;
  },
});