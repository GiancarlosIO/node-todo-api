const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const expect = require('expect');
const request = require('supertest');

const app = require('../../server/server');

const { Todo } = require('../../server/models/todo');
const { User } = require('../../server/models/user');

const { todos, populateTodos, users, populateUsers } = require('../seed/seed');

// clean all models and schemas
mongoose.models = {};
mongoose.modelSchemas = {};

beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /api/todos', () => {
  it('should create a new todo', (done) => {
    const text = 'Test Todo text';

    request(app)
      .post('/api/todos')
      .send({ text })
      .expect(201)
      .expect((res) => {
        expect(res.body.text).toBe(text);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.find({ text }).then((todos) => {
          expect(todos.length).toBe(1);
          expect(todos[0].text).toBe(text);
          done();
        }).catch(e => done(e));
      });
  });

  it('should not create a todo with invalid text', (done) => {
    const text = '';

    request(app)
      .post('/api/todos')
      .send({ text })
      .expect(400)
      .end((err, res) => {
        if (err) return done(err);

        Todo.find().then((todos) => {
          expect(todos.length).toBe(2);
          done();
        }).catch(e => done(e));
      });
  });
});


describe('GET /api/todos', () => {
  it('should get all todos', (done) => {
    request(app)
      .get('/api/todos')
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(2);
      })
      .end(done);
  });
});

describe('GET /api/todos/:id', () => {
  it('should return the todo doc by id', (done) => {
    request(app)
      .get(`/api/todos/${todos[0]._id.toHexString()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(todos[0].text);
      })
      .end(done);
  });

  it('should return 404 and error message when todo is not found', (done) => {
    const todoId = (new ObjectId()).toHexString();
    request(app)
      .get(`/api/todos/${todoId}`)
      .expect(404)
      .expect((res) => {
        expect(res.body.error).toBe('Todo not exists');
      })
      .end(done);
  });

  it('should return 400 and error message when id is not valid', (done) => {
    const invalidId = '123';

    request(app)
      .get(`/api/todos/${invalidId}`)
      .expect(400)
      .expect((res) => {
        expect(res.body.error).toBe('id is invalid')
      })
      .end(done);
  })
});

describe('DELETE /api/todos/:id', () => {
  it('should remove a todo', (done) => {
    const todoId = todos[0]._id.toHexString();
    request(app)
      .delete(`/api/todos/${todoId}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(todos[0].text);
        expect(res.body.message).toBe('deleted successfully');
      })
      .end((err, res) => {
        if (err) return done(err);

        Todo.findById(todoId)
          .then((todo) => {
            expect(todo).toBeFalsy();
            done();
          }).catch(err => done(err));
      });
  });

  it('should return 404and error message when todo is not found', (done) => {
    const todoId = (new ObjectId()).toHexString();

    request(app)
      .delete(`/api/todos/${todoId}`)
      .expect(404)
      .expect((res) => {
        expect(res.body.error).toBe('Todo not exists');
      })
      .end(done);
  });

  it('should return 400 and error message when is is not valid', (done) => {
    request(app)
      .delete('/api/todos/123')
      .expect(400)
      .expect(({ body: { error } }) => {
        expect(error).toBe('id is invalid');
      })
      .end(done);
  });
});


describe('PATCH /api/todos/:api', () => {
  it('should update the todo succesfully', (done) => {
    request(app)
      .patch(`/api/todos/${todos[0]._id.toHexString()}`)
      .send({ completed: true, text: 'updated text' })
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe('updated text');
        expect(res.body.todo.completed).toBe(true);
        expect(typeof res.body.todo.completedAt).toBe('number');
      })
      .end(done);
  });

  it ('should clear completed and completedAt when todo is not completed', (done) => {
    request(app)
      .patch(`/api/todos/${todos[1]._id.toHexString()}`)
      .send({ completed: false, text: 'text updated' })
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe('text updated');
        expect(res.body.todo.completed).toBe(false);
        expect(res.body.todo.completedAt).toBe(null);
      })
      .end(done);
  });
});

describe('GET /api/users/me', () => {
  it('should return a user if authenticated', (done) => {
    request(app)
      .get('/api/users/me')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body._id).toBe(users[0]._id.toHexString());
        expect(res.body.email).toBe(users[0].email);
      })
      .end(done)
  });

  it('should return a 401 if if token is not send or it is invalid', (done) => {
    request(app)
      .get('/api/users/me')
      .set('x-auth', '')
      .expect(401)
      .expect((res) => {
        expect(res.body.error).toBe('invalid token');
      })
      .end(done);
  });
});

describe('POST /api/users/', () => {
  it('should create a user', (done) => {
    const email = 'usertest@gmail.com';
    const password = '123123123';

    request(app)
      .post('/api/users')
      .send({ email, password })
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toBeTruthy();
        expect(res.body._id).toBeTruthy();
        expect(res.body.email).toBe(email);
      })
      .end((err) => {
        if (err) done(err);

        User.findOne({ email }).then((user) => {
          expect(user).toBeTruthy();
          expect(user.password).not.toBe(password);
          done();
        }).catch(done);
      });
  });

  it('should return validations errors if request is invalid', (done) => {
    request(app)
      .post('/api/users')
      .send({ email: 'and', password: '123' })
      .expect(400)
      .end(done);
  });

  it('should not create a user if email is in use', (done) => {
    request(app)
      .post('/api/users')
      .send({ email: users[0].email, password: '123123123' })
      .expect(400)
      .end(done);
  });
});

describe('POST /api/users/login', () => {
  it('should login user and return header token', (done) => {
    request(app)
      .post('/api/users/login')
      .send({ email: users[1].email, password: users[1].password })
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toBeTruthy();
      })
      .end((err, res) => {
        if (err) return done(err);

        User.findById(users[1]._id).then((user) => {
          expect(user.tokens[0].access).toBe('auth');
          expect(user.tokens[0].token).toBe(res.headers['x-auth']);
          done();
        }).catch(done);
      });
  });

  it('should reject invalid login', (done) => {
    request(app)
      .post('/api/users/login')
      .send({ email: users[1].email, password: users[1].password + '23' })
      .expect(400)
      .expect((res) => {
        expect(res.headers['x-auth']).toBeFalsy();
      })
      .end((err, res) => {
        if (err) return done(err);

        User.findById(users[1]._id).then((user) => {
          expect(user.tokens.length).toBe(0);
          done();
        }).catch(done);
      })
  });
})