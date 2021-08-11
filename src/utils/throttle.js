const throttle = (callback, ms) => {
  let throttleCheck;

  return function (...rest) {
    if (!throttleCheck) {
      throttleCheck = true;
      setTimeout(() => {
        callback(rest);
        throttleCheck = false;
      }, ms);
    }
  };
};

export default throttle;
