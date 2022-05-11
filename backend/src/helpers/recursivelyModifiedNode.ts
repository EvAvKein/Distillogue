import {Node} from "../objects";

export function recursivelyModifiedNode(node:Node, modifiedProperty:string, callbackReturningModified:(property:any) => any) {
  (node[modifiedProperty as keyof Node] as any) = callbackReturningModified(node[modifiedProperty as keyof Node]); // 

  node.replies.forEach((subNode) => {
    recursivelyModifiedNode(subNode, modifiedProperty, callbackReturningModified);
  });

  return node;
};

// typed modifiedProperty as string and retyped it for modifiedProperty just to satisfy typescript, because the closest solution i've found for typing these 'properly' is still very obtuse. see: https://stackoverflow.com/questions/58434389/typescript-deep-keyof-of-a-nested-object/58436959#58436959

// typed "node[modifiedProperty]" as "any" because otherwise it's "never"; attempting to apply a value to any of multiple properties causes that to be typed as an intersection of all property types, which is "never" a viable type considering Node properties' variety. see: https://github.com/microsoft/TypeScript/issues/32375

// typed callback's parameter and return value as any for a mix of the above two reasons


// if you know a concise way to correct any of the above type-safety issues, contribution(s) would be much appreciated. i think i gave this level of type-safety the requisite time/attention, considering i'm currently the sole dev with no prospective contributors and much much more to get done