const AuthenticateMiddleware = (User) => (req, res, next) => {
  const token = req.header('x-auth');

  User.findByToken(token)
    .then((user) => {
      if (!user) {
        res.status(404).send({
          error: 'user not exists',
        });
      } else {
        // res.json(user.toJSON());
        req.user = user;
        req.token = token;
        next();
      }
    })
    .catch(() => {
      res.status(401).send({
        error: 'invalid token',
      });
    });
};

module.exports = AuthenticateMiddleware;
