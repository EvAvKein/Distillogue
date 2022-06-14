function unix() {return Math.floor(Date.now() / 1000)};
function iso() {return new Date().toISOString()};

export {
  unix,
  iso,
};