import {User} from "../../shared/objects/user";
import {Node} from "../../shared/objects/post";
import {MongoClient, Collection} from "mongodb";
const mongo = new MongoClient(process.env.DOCKERIZED ? "mongodb://mongodb:27017" : "mongodb://localhost");
await mongo.connect().catch(() => {console.log("Failed to connect to database :\\")});

const database = mongo.db("distllogue");
const users = database.collection("users") as Collection<User>;
const posts = database.collection("posts") as Collection<Node>;

export {
  users,
  posts,
};