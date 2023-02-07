import {User} from "../../shared/objects/user";
import {Node} from "../../shared/objects/post";
import {MongoClient} from "mongodb";
const mongo = new MongoClient(process.env.DOCKERIZED ? "mongodb://mongodb:27017" : "mongodb://localhost");
await mongo.connect().catch(() => console.log("Failed to connect to database :\\"));

const database = mongo.db("distillogue");
const users = database.collection<User>("users");
const posts = database.collection<Node>("posts");

export {users, posts};
