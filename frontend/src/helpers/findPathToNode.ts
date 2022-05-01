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