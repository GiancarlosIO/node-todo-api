const MongoClient = require('mongodb').MongoClient;

// connection url
const mongoUrl = 'mongodb://localhost:27017';

// database name
const dbname = 'TodoApp';

const insertDocuments = (db, callback) => {
  const collection = db.collection('Todos');

  collection.insertMany([
    {text: 'first todo', completed: false},
    {text: 'second todo', completed: true},
  ], (err, result) => {
    if (err) return console.log('error to add entries to todo collection');
    console.log('Inserted 3 records to todos collections');
    callback(result);
  });
}

MongoClient.connect(mongoUrl, (err, client) => {
  if (err) {
    return console.log('a error has occurred to try to connect to mongodb')
  }

  console.log('Connected successfully to server');
  const db = client.db(dbname);

  insertDocuments(db, () => {
    client.close()
  });
});