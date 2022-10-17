import {defineStore} from "pinia";
import {UserPatchRequest} from "../../../shared/objects/api";
import {editableUserData, UserData} from "../../../shared/objects/user";
import {deepCloneFromReactive} from "../helpers/deepCloneFromReactive";

export const useDashboardEdits = defineStore("dashboardEdits", {
  state: () => {return {edits:[] as UserPatchRequest<editableUserData>[]}}, // i'd declare it as an array (instead of an object containing it), but i couldn't figure out a way to reference it in actions without that throwing a circular reference error

  actions: {
    ofData<dataType extends editableUserData>(dataName:dataType) {
      const data = deepCloneFromReactive(this.edits)
        .filter((change) => change.dataName === dataName)[0]
        
      return data ? data.newValue as UserData[dataType] : undefined;
    },
  },
});