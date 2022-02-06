let timer:undefined|number;
export function debounce(func:Function, delay:number) {
  if (timer) {
    clearTimeout(timer);
  };
  timer = setTimeout(func, delay);
};