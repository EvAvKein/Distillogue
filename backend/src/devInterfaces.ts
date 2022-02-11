interface fetchResponse {
  error: false|{
    message:string;
  };
  data?:true|object|any[];
};

interface userData {
  id:string,
  name:string,
  about?:string,
  settings?:object;
};
type editableUserData = "name"|"about"|"settings";
const arrOfEditableUserData = ["name", "about", "settings"] as editableUserData[];

interface user {
  registered: boolean;
  data: userData,
};

export {
  fetchResponse,
  user,
  userData,
  editableUserData,
  arrOfEditableUserData
};