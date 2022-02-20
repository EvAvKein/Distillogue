import {v4 as uuidV4} from "uuid";
const prefixes = { // could be used to identify an id's type by searching for these substrings
  userId: "USER:",
  nodeId: "NODE:",
  logId: "LOG:",
};

function newId(prefixType:"user"|"node"|"log"):string {
  let prefix;
  switch (prefixType) {
    case "user": {
      prefix = prefixes.userId;
      break;
    };
    case "node": {
      prefix = prefixes.nodeId;
      break;
    };
    case "log": {
      prefix = prefixes.logId;
      break;
    };
  };

  return prefix + uuidV4();
};

export {
  prefixes,
  newId,
};