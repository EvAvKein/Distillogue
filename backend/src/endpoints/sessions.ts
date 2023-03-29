import {type Express} from "express";
import {type Collection} from "mongodb";
import * as apiSchemas from "../schemas/api.js";
import {User, UserSession, UserPayload} from "../../../shared/objects/user.js";
import {FetchResponse} from "../../../shared/objects/api.js";
import {sessionKey} from "../helpers/reqHeaders.js";
import {fromZodError} from "zod-validation-error";

export default function (app: Express, usersDb: Collection<User>) {
	app.get("/api/sessions", async (request, response) => {
		const sessionkey = sessionKey(request);

		const user = await usersDb.findOne({sessions: {$elemMatch: {key: sessionkey}}});

		if (!user) {
			response.status(404).json(new FetchResponse(null, {message: "User session not found"}));
			return;
		}

		response.status(200).json(new FetchResponse(user.data));
	});

	app.post("/api/sessions", async (request, response) => {
		const validation = apiSchemas.UserCreationRequest.safeParse(request.body); // obviously not a user creation request, but they use the same object (until proper auth)

		if (!validation.success) {
			response.status(400).json(new FetchResponse(null, {message: fromZodError(validation.error).message}));
			return;
		}

		const auth = validation.data;
		const newSession = new UserSession();

		const dbResponse = await usersDb.findOneAndUpdate(
			{"data.name": auth.username}, // temporary, of course. until proper auth
			{$addToSet: {sessions: newSession}}
		);

		if (!dbResponse.value) {
			response.status(404).json(new FetchResponse(null, {message: "User not found"}));
			return;
		}

		response.status(201).json(new FetchResponse(new UserPayload(newSession.key, dbResponse.value.data)));
	});

	// endpoint pending a sessions dashboard section which'd make this relevant
	// app.patch("/api/sessions", async (request, response) => {
	// });

	app.delete("/api/sessions", async (request, response) => {
		const session = sessionKey(request);

		const dbResponse = await usersDb.updateOne(
			{sessions: {$elemMatch: {key: session}}},
			{$pull: {sessions: {key: session}}}
		);

		if (!dbResponse.modifiedCount) {
			response.status(404).json(new FetchResponse(null, {message: "Failed to find session"}));
			return;
		}

		response.status(200).end();
	});
}
