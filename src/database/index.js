const mongoose = require('mongoose');
//const url = 'mongodb://ademir:KqGa4!0S@cluster0-3eusa.mongodb.net';

//mongoose.connect('mongodb://localhost/noderest', { useMongoClient: true });
mongoose.connect('mongodb://localhost:27017/noderest', { useCreateIndex: true, useNewUrlParser: true });
//mongoose.connect('mongodb://user:password@sample.com:port/dbname', { useNewUrlParser: true });
//mongoose.connect(url, { useNewUrlParser: true });

mongoose.Promise = global.Promise;

module.exports = mongoose;
