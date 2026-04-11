const { validationResult } = require("express-validator");

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400);
    return next(new Error(errors.array().map((error) => error.msg).join(", ")));
  }

  next();
};

module.exports = validateRequest;
