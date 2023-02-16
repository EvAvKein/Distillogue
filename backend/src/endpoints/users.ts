import {type Express} from "express";
import {type Collection} from "mongodb";
import * as apiSchemas from "../joi/api.js";
import {validationSettings} from "../joi/_validationSettings.js";
import {mongoInsertIfDoesntExist} from "../helpers/mongo/mongoInsertIfDoesntExist.js";
import {User, UserData, UserPayload, arrOfEditableUserData} from "../../../shared/objects/user.js";
import {FetchResponse} from "../../../shared/objects/api.js";
import {PostConfig} from "../../../shared/objects/post.js";
import {sessionKey} from "../helpers/reqHeaders.js";

export default function (app: Express, usersDb: Collection<User>) {
	app.post("/api/users", async (request, response) => {
		const validation = apiSchemas.UserCreationRequest.validate(request.body, validationSettings);
		if (validation.error) {
			response.status(400).json(new FetchResponse(null, {message: validation.error.message}));
			return;
		}

		const username = validation.value.username;
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
		const validation = apiSchemas.UserPatchRequestArray.validate(request.body, validationSettings);
		if (validation.error) {
			response.status(400).json(new FetchResponse(null, {message: validation.error.message}));
			return;
		}

		const session = sessionKey(request);
		const editRequests = validation.value;

		for (let request of editRequests) {
			if (!arrOfEditableUserData.includes(request.dataName)) {
				response.status(400).json(new FetchResponse(null, {message: "Invalid data insertion request"}));
				return;
			}

			if (request.dataName === "presets" && (request.newValue as PostConfig).access) {
				delete (request.newValue as PostConfig).access;
			}
		}

		const mongoUpdateObject = {} as {[key: string]: any};
		// ^ TODO: a bare minimum type, because idk how declare the type below without actually requiring a type argument (i.e infer T from key and apply it to type of value)
		//	type mongoUpdateObject<T extends editableUserData> = {[key in `data.${T}`]: UserData[T]};

		editRequests.forEach((request) => {
			mongoUpdateObject["data." + request.dataName] = request.newValue;
		});

		const dbResponse = await usersDb.updateOne({sessions: {$elemMatch: {key: session}}}, {$set: mongoUpdateObject});

		if (!dbResponse.modifiedCount) {
			response.status(500).json(new FetchResponse(null, {message: "Failed to update database"}));
			return;
		}

		response.status(204).json(new FetchResponse(true));
	});
}
