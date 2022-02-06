import {defineStore} from 'pinia';
import {user} from "../../../backend/src/devInterfaces";

export const useUser = defineStore('user', {
  state: () => {
    return <user>{
      registered: false,
      data: {},
    };
  },
});