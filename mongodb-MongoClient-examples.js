//CRUD

// const MongoClient = mongodb.MongoClient; //Mongoclient will give access to the method that can access database
// const ObjectID = mongodb.ObjectID;
const { MongoClient, ObjectID } = require('mongodb');

const connectionURL = 'mongodb://127.0.0.1:27017';
const databaseName = 'task-manager';

MongoClient.connect(
  connectionURL,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (error, client) => {
    if (error) {
      return console.log('Unable to connect to the database');
    }

    const db = client.db(databaseName);
    db.collection('users').insertOne(
      {
        name: 'Riju',
        age: 33,
      },
      (error, result) => {
        if (error) {
          return console.log('Unable to insert user');
        }

        console.log(result.ops);
      }
    );

    db.collection('users').insertMany(
      [
        {
          name: 'Merlin',
          age: 30,
        },
        {
          name: 'Riju',
          age: 33,
        },
      ],
      (error, result) => {
        if (error) {
          return console.log('Unable to insert documents!');
        }

        console.log('Inserted data count ', result.insertedCount);
        console.log('Ops :', result.ops);
        console.log('Inserted IDs: ', result.insertedIds);
        console.log('Connection objects: ', result.connection);
        console.log('Result added correctly: ', result.result.ok);
        console.log('Result added count: ', result.result.n);
      }
    );

    db.collection('tasks').insertMany(
      [
        {
          description: 'Sending email to cap managers',
          completed: true,
        },
        {
          description: 'Accept email from candidates',
          completed: true,
        },
        {
          description: 'Announce exam date',
          completed: false,
        },
      ],
      (error, result) => {
        if (error) {
          return console.log('Unable to insert documents!');
        }

        console.log('Inserted data count', result.insertedCount);
        console.log('Ops', result.ops);
        console.log('Result correctly added count', result.result.n);
      }
    );

    db.collection('users').findOne(
      { _id: new ObjectID('5f03ee16f17df38629cda727') }, // objectid reference (new ObjectID) has been used here as we need to get the reference of hex code and a query using just the string will return a null response
      (error, user) => {
        if (error) {
          return console.log('Unable to fetch');
        }

        console.log(user);
      }
    );

    db.collection('tasks')
      .find({ completed: true }) //find returns a cursor and no callback allowed
      .toArray((error, users) => {
        console.log(users);
      });

    const updatePromise = db.collection('users').updateOne(
      {
        _id: new ObjectID('5f03ee16f17df38629cda727'),
      },
      { $set: { name: 'Merlin Raju' } }
    );

    updatePromise
      .then((result) => {
        console.log(result);
      })
      .catch((error) => {
        console.log(error);
      });

    db.collection('tasks')
      .deleteOne({
        completed: false,
      })
      .then((result) => {
        console.log(result);
      })
      .catch((error) => {
        console.log(error);
      });
  }
);
