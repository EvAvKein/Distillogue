import {Node} from "../objects";

export function recursivelyModifiedNode(node:Node, modifiedProperty:string, callbackReturningModified:(node:Node[keyof Node]) => Node[keyof Node]) {
  (node[modifiedProperty as keyof Node] as any) = callbackReturningModified(node[modifiedProperty as keyof Node]); // 

  node.replies.forEach((subNode) => {
    recursivelyModifiedNode(subNode, modifiedProperty, callbackReturningModified);
  });

  return node;
};

// typed modifiedProperty as string and retyped it for modifiedProperty just to satisfy typescript, because the closest solution i've found for typing these 'properly' is still very obtuse. see: https://stackoverflow.com/questions/58434389/typescript-deep-keyof-of-a-nested-object/58436959#58436959

// typed "node[modifiedProperty]" as "any" because otherwise it's "never"; attempting to apply a value to an unknown property causes that to be typed as an intersection of all property types, which is "never" a viable type considering Node properties' variety. see: https://github.com/microsoft/TypeScript/issues/32375


// if you know a concise way to correct either of the above type-safety issues, contribution(s) would be much appreciated. i think i gave this level of type-safety the requisite time/attention, considering i'm currently the sole dev with no prospective contributors and much much more to get done