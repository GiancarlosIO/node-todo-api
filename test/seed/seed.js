const { ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const { Todo } = require('../../server/models/todo');
const { User } = require('../../server/models/user');

const userIdOne = new ObjectId();
const userIdTwo = new ObjectId();

const users = [
  {
    _id: userIdOne,
    email: 'user1@gmail.com',
    password: 'user1pass',
    tokens: [
      {
        access: 'auth',
        token: jwt.sign({ _id: userIdOne, access: 'auth' }, 'abc123').toString(),
      },
    ],
  },
  {
    _id: userIdTwo,
    email: 'user2@gmail.com',
    password: 'user2pass',
  },
];

const todos = [
  {
    _id: new ObjectId(),
    text: 'first tests todo',
  },
  {
    _id: new ObjectId(),
    text: 'second tests todo',
    completed: true,
    completedAt: 333,
  },
];

const populateTodos = (done) => {
  Todo.remove({}).then(() => {
    return Todo.insertMany(todos)
  }).then(() => done());
};

const populateUsers = (done) => {
  User.remove({}).then(() => {
    const userOne = new User(users[0]).save();
    const userTwo = new User(users[1]).save();

    return Promise.all([ userOne, userTwo ]);
  }).then(() => done());
};

module.exports = {
  todos,
  populateTodos,
  users,
  populateUsers,
};
