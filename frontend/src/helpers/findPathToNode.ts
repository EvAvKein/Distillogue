import {Node} from "../../../backend/src/objects";

export async function findPathToNode(postObject:Node, targetNodeId:Node["id"]) {
  let ancestry = [] as Node["id"][];

  async function lookForTargetNode(currentNode:Node, targetNodeId:Node["id"], ancestryOfCurrent:Node["id"][]):Promise<void> {
    if (ancestry.includes(targetNodeId)) {
      return;
    };

    const ancestryWithCurrentNode = [...ancestryOfCurrent, currentNode.id];

    if (currentNode.id == targetNodeId) {
      ancestry = ancestryWithCurrentNode;
      return;
    };
  
    currentNode.replies.forEach((replyNode) => {
      lookForTargetNode(replyNode, targetNodeId, ancestryWithCurrentNode);
    });
  };

  await lookForTargetNode(postObject, targetNodeId, []);

  return ancestry;
};

// no longer in use because i figured it's probably better to have a slower load time than slower interaction time (and the requisite refactor put this out of use). keeping it here for the time being because it's still potentially useful code, will probably create an archive folder in future 