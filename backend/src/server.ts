import path from "node:path";
import express from "express";
import helmetSecurity from "helmet";
import {users, posts} from "./mongo.js";
import endpoints_users from "./endpoints/users.js";
import endpoints_sessions from "./endpoints/sessions.js";
import endpoints_posts from "./endpoints/posts.js";
import endpoints_postsInteractions from "./endpoints/posts_interactions.js";
import * as timestamp from "../../shared/helpers/timestamps.js";

const app = express();
app.use(express.static("../frontend/dist"));
app.use(express.json());
app.use(helmetSecurity());

await posts.deleteMany({});
await users.deleteMany({});

endpoints_users(app, users);
endpoints_sessions(app, users);
endpoints_posts(app, posts, users);
endpoints_postsInteractions(app, posts, users);

app.get("*", function (request, response) {
	response.sendFile(path.join(process.cwd() + "/../frontend/dist/index.html"));
});

const port = 3000;
app.listen(port, () => {
	console.log(`Server Online at http://localhost${process.env.DOCKERIZED ? "" : ":" + port}
  Date: ${timestamp.iso()}`);
});
