let timer:undefined|number;
export default function(func:Function, delay:number) {
  if (timer) {
    clearTimeout(timer);
  };
  timer = setTimeout(func, delay);
};