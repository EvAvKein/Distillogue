import {type Express} from "express";
import {type Collection} from "mongodb";
import * as apiSchemas from "../schemas/api.js";
import * as userSchemas from "../schemas/user.js";
import {User, UserSession, UserPayload} from "../../../shared/objects/user.js";
import {FetchResponse} from "../../../shared/objects/api.js";
import {sessionKey} from "../helpers/reqHeaders.js";
import {authUser} from "../helpers/authUser.js";
import {fromZodError} from "zod-validation-error";

export default function (app: Express, usersDb: Collection<User>) {
	app.get("/api/sessions", async (request, response) => {
		const user = await authUser(request);

		user
			? response.status(200).json(new FetchResponse(user.sessions))
			: response.status(404).json(new FetchResponse(null, {message: "User sessions not found"}));
	});

	app.post("/api/sessions", async (request, response) => {
		const validation = apiSchemas.UserCreationRequest.safeParse(request.body); // until proper auth
		if (!validation.success) {
			response.status(400).json(new FetchResponse(null, {message: fromZodError(validation.error).message}));
			return;
		}

		const dbUserResponse = await usersDb.findOne({"data.name": validation.data.username});
		if (!dbUserResponse) {
			response.status(404).json(new FetchResponse(null, {message: "User not found"}));
			return;
		}

		const newSession = new UserSession("Session " + (dbUserResponse.sessions.length + 1)); // TODO: come up with a decent format for session-name defaults, one that doesn't result in querying the database twice in this endpoint. (considered a timestamp, but that won't match with client timezone)

		const dbResponse = await usersDb.findOneAndUpdate(
			{"data.name": validation.data.username}, // until proper auth
			{$addToSet: {sessions: newSession}}
		);
		if (!dbResponse.value) {
			response.status(500).json(new FetchResponse(null, {message: "Server error during session creation"}));
			return;
		}

		response.status(201).json(new FetchResponse(new UserPayload(newSession.key, dbResponse.value.data)));
	});

	app.patch("/api/sessions", async (request, response) => {
		const session = sessionKey(request);

		const validation = userSchemas.UserSession.safeParse(request.body);
		if (!validation.success) {
			response.status(400).json(new FetchResponse(null, {message: fromZodError(validation.error).message}));
			return;
		}

		const dbResponse = await usersDb.findOneAndUpdate(
			{"sessions.key": session},
			{$set: {"sessions.$": validation.data}},
			{returnDocument: "after"}
		);

		if (!dbResponse.ok) {
			response.status(500).json(new FetchResponse(null, {message: "Failed to update session"})); // could also be 400 if the session didn't exist, but AI recommended to default to 500 when unknown whether 4xx or 5xx
			return;
		}

		response.status(200).json(new FetchResponse(dbResponse.value?.sessions));
	});

	app.delete("/api/sessions", async (request, response) => {
		const session = sessionKey(request);

		const validation = userSchemas.UserSession.pick({key: true}).partial().safeParse(request.body, {});
		if (!validation.success) {
			response.status(400).json(new FetchResponse(null, {message: fromZodError(validation.error).message}));
			return;
		}

		const dbResponse = await usersDb.updateOne(
			{"sessions.key": session},
			{$pull: {sessions: {key: validation.data?.key ?? session}}}
		);

		if (!dbResponse.modifiedCount) {
			response.status(404).json(new FetchResponse(null, {message: "Failed to find session"}));
			return;
		}

		response.status(200).end();
	});
}
