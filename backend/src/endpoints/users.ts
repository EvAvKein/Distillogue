import {type Express} from "express";
import {type Collection} from "mongodb";
import * as apiSchemas from "../schemas/api.js";
import {mongoInsertIfDoesntExist} from "../helpers/mongo/mongoInsertIfDoesntExist.js";
import {User, UserData, UserPayload, arrOfEditableUserData} from "../../../shared/objects/user.js";
import {FetchResponse} from "../../../shared/objects/api.js";
import {sessionKey} from "../helpers/reqHeaders.js";
import {authUser} from "../helpers/authUser.js";
import {fromZodError} from "zod-validation-error";

export default function (app: Express, usersDb: Collection<User>) {
	app.get("/api/users", async (request, response) => {
		const user = await authUser(request);

		user
			? response.status(200).json(new FetchResponse(user.data))
			: response.status(404).json(new FetchResponse(null, {message: "User session not found"}));

		// admittedly not a RESTful URI for this use-case, but:
		// 1. i have no plans to every allow people to just query for the entire userbase (except probably admin, but they have their own endpoints)
		// 2. the RESTful way to do this would probably be "/users:id".... but that requires storing the user ID on the client and handling it (both frontend and backend), which currently seems excessive.
		// TODO: before 1.0, consider whether to favor RESTfulness by making the change in list item 2, even as it creates code & perf bloat
	});

	app.post("/api/users", async (request, response) => {
		const validation = apiSchemas.UserCreationRequest.safeParse(request.body);
		if (!validation.success) {
			response.status(400).json(new FetchResponse(null, {message: fromZodError(validation.error).message}));
			return;
		}

		const username = validation.data.username;
		const newUser = new User(new UserData(username));

		const dbResponse = await mongoInsertIfDoesntExist(usersDb, newUser, {"data.name": username});

		if (dbResponse.matchedCount) {
			response.status(403).json(new FetchResponse(null, {message: "User already exists!"}));
			return;
		}

		response.status(201).json(new FetchResponse(new UserPayload(newUser.sessions[0].key, newUser.data)));
	});

	app.patch("/api/users", async (request, response) => {
		// TODO: the "PUT" method seems more appropriate, as it's receiving a complete replacement... but this would require changing the endpoint's path as to not indicate complete user-data replacement, probably changing to "/users/[userId]/[property]"
		const validation = apiSchemas.UserPatchRequestArray.safeParse(request.body);
		if (!validation.success) {
			response.status(400).json(new FetchResponse(null, {message: fromZodError(validation.error).message}));
			return;
		}

		const session = sessionKey(request);
		const editRequests = validation.data;

		const mongoUpdateObject = {} as {[key: string]: any};
		// ^ TODO: a bare minimum type, because idk how declare the type below without actually requiring a type argument (i.e. infer T from key and apply it to type of value)
		//	type mongoUpdateObject<T extends editableUserData> = {[key in `data.${T}`]: UserData[T]};
		for (let request of editRequests) {
			if (!arrOfEditableUserData.includes(request.dataName)) {
				response.status(400).json(new FetchResponse(null, {message: "Invalid data insertion request"}));
				return;
			}

			mongoUpdateObject["data." + request.dataName] = request.newValue;
		}

		const dbResponse = await usersDb.updateOne({"sessions.key": session}, {$set: mongoUpdateObject});

		if (!dbResponse.acknowledged || !dbResponse.matchedCount) {
			response.status(500).json(new FetchResponse(null, {message: "Failed to update database"}));
			return;
		}

		response.status(204).end();
	});
}
