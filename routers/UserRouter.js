const express = require('express');

// middlewares
const AuthenticateMiddleware = require('../middlewares/auth/AuthenticateMiddleware');

const UserRouter = (User) => {
  const router = express.Router();

  // middleware to find current user
  router.use('/me', AuthenticateMiddleware(User));

  router
    .post('/', async (req, res) => {
      const { body: { email, password } } = req;

      const user = new User({ email, password });

      try {
        await user.save()
        const token = await user.generateAuthToken();

        res.header('x-auth', token).send(user.toJSON());
      } catch (e) {
        res.status(400).json(e)
      }
    })
    .get('/me', (req, res) => {
      const { user } = req;
      const token = req.header('x-auth');

      res.json(user.toJSON());
    })
    .delete('/me/token', async (req, res) => {
      try {
        await  req.user.removeToken(req.token);
        res.status(200).send({ message: 'logout successfully' });
      } catch (e) {
        res.status(400).send({ error: 'error to logout' });
      }
    })
    .post('/login', async (req, res) => {
      const { body: { email, password } } = req;

      try {
        const user = await User.findByCredentials(email, password);
        const token = await user.generateAuthToken();

        res.header('x-auth', token).send(user);
      } catch (e) {
        res.status(400).send(e);
      }
    });

  return router;
}



module.exports = UserRouter;
