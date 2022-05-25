export function randomAlphanumString(LengthMultiplier?:number, withSpaces?:true) {
  let string = "";

  for (let remainder = LengthMultiplier || 1; remainder > 0; remainder--) {
    if (withSpaces && remainder < LengthMultiplier) {string += " "};
    string += Math.random().toString(36).slice(2);
  };

  return string;
};