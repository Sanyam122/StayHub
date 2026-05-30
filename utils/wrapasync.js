// utils/wrapasync.js
module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next); // ✅ sirf next pass karo, call mat karo
  };
};
