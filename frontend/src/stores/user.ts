import {defineStore} from 'pinia';
import {User} from "../../../backend/src/objects.js";

export const useUser = defineStore('user', {
  state: () => {
    return {data: {}} as User;
  },
});