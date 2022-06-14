import {Node} from "../../../shared/objects";

export function recursivelyModifyNode(node:Node, callbackReturningModified:(node:Node) => Node) {
  let modifiedNode = callbackReturningModified(node);
  
  modifiedNode.replies.forEach((subNode:Node) => {
    recursivelyModifyNode(subNode, callbackReturningModified);
  });
  
  return modifiedNode;
};