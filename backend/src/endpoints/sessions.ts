import {type Express} from "express";
import {type Collection} from "mongodb";
import * as apiSchemas from "../joi/api.js";
import {validationSettings} from "../joi/_validationSettings.js";
import {User, UserSession, UserPayload} from "../../../shared/objects/user.js";
import {FetchResponse} from "../../../shared/objects/api.js";
import {sessionKey} from "../helpers/reqHeaders.js";

export default function (app: Express, usersDb: Collection<User>) {
	app.get("/api/sessions", async (request, response) => {
		const sessionkey = sessionKey(request);

		const user = await usersDb.findOne({sessions: {$elemMatch: {key: sessionkey}}});

		if (!user) {
			response.json(new FetchResponse(null, "User session not found"));
			return;
		}

		response.json(new FetchResponse(user.data));
	});

	app.post("/api/sessions", async (request, response) => {
		const validation = apiSchemas.UserCreationRequest.validate(request.body, validationSettings); // obviously not a user creation request, but they use the same object (until proper auth)

		if (validation.error) {
			response.json(new FetchResponse(null, validation.error.message));
			return;
		}

		const auth = validation.value;
		const newSession = new UserSession();

		const dbResponse = await usersDb.findOneAndUpdate(
			{"data.name": auth.username}, // temporary, of course. until proper auth
			{$addToSet: {sessions: newSession}}
		);

		if (!dbResponse.value) {
			response.json(new FetchResponse(null, "User not found"));
			return;
		}

		response.json(new FetchResponse(new UserPayload(newSession.key, dbResponse.value.data)));
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
			response.json(new FetchResponse(null, "Failed to find session"));
			return;
		}

		response.json(new FetchResponse(true));
	});
}