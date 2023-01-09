import {defineStore} from "pinia";
import {UserData} from "../../../shared/objects/user";

interface userStore {
	data?: UserData;
}

export const useUser = defineStore("user", {
	state: () => {
		return {data: undefined} as userStore;
	},
});
