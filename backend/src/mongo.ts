import {User} from "../../shared/objects/user";
import {Post} from "../../shared/objects/post";
import {MongoClient} from "mongodb";
const mongo = new MongoClient(process.env.DOCKERIZED ? "mongodb://mongodb:27017" : "mongodb://localhost");
await mongo.connect().catch(() => console.log("Failed to connect to database :\\"));

const database = mongo.db("distillogue");
export const users = database.collection<User>("users");
export const posts = database.collection<Post>("posts");
