const express = require('express');

// middlewares
const AuthenticateMiddleware = require('../middlewares/auth/AuthenticateMiddleware');

const UserRouter = (User) => {
  const router = express.Router();

  // middleware to find current user
  router.use('/me', AuthenticateMiddleware(User));

  router
    .post('/', (req, res) => {
      const { body: { email, password } } = req;

      const user = new User({ email, password });

      user.save().then(() => user.generateAuthToken()) // it return another promise
        .then((token) => {
          res
            .header('x-auth', token)
            .send(user.toJSON());
        })
        .catch(err => res.status(400).json(err));
    })
    .get('/me', (req, res) => {
      const { user } = req;
      const token = req.header('x-auth');

      res.json(user.toJSON());
    })
    .delete('/me/token', (req, res) => {
      req.user.removeToken(req.token).then(() => {
        res.status(200).send({ message: 'logout successfully' });
      }).catch(() => res.status(400).send({ error: 'error to logout' }));
    })
    .post('/login', (req, res) => {
      const { body: { email, password } } = req;

      User.findByCredentials(email, password)
        .then((user) => {
          return user.generateAuthToken().then((token) => {
            res.header('x-auth', token).send(user);
          });
        }).catch((e) => {
          res.status(400).send(e);
        });
    });

  return router;
}



module.exports = UserRouter;
