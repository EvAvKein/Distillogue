import {MongoClient} from "mongodb";
const mongo = new MongoClient('mongodb://localhost');
await mongo.connect().catch(() => {console.log("Failed to connect to database :\\")});

const database = mongo.db('distllogue');
const users = database.collection('users');
const posts = database.collection('posts');

export {
  users,
  posts,
};