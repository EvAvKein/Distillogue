interface fetchResponse {
  error: false|{
    message:string;
  };
  data?:object|any[];
};

interface userData {
  id:string,
  name:string,
  about?:string,
  settings?:object;
};

interface user {
  registered: boolean;
  data: userData,
};

export {
  fetchResponse,
  user,
  userData
};