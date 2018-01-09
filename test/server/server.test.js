const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const expect = require('expect');
const request = require('supertest');

const app = require('../../server/server');

const { Todo } = require('../../server/models/todo');

// clean all models and schemas
mongoose.models = {};
mongoose.modelSchemas = {};

const todos = [
  {
    _id: new ObjectId(),
    text: 'first tests todo',
  },
  {
    _id: new ObjectId(),
    text: 'second tests todo',
  }
]

beforeEach((done) => {
  Todo.remove({}).then(() => {
    return Todo.insertMany(todos)
  }).then(() => done());
});

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

  it('should return 404 and error message when id is not found', (done) => {
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