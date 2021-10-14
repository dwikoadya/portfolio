exports.getMe = (req, next) => {
  req.params.id = req.user.id;
  next();
};
