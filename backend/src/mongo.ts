import {Node, User} from "../../shared/objects";
import {MongoClient, Collection} from "mongodb";
const mongo = new MongoClient("mongodb://localhost");
await mongo.connect().catch(() => {console.log("Failed to connect to database :\\")});

const database = mongo.db("distllogue");
const users = database.collection("users") as Collection<User>;
const posts = database.collection("posts") as Collection<Node>;

export {
  users,
  posts,
};