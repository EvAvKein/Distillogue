import {type Express} from "express";
import {type Collection} from "mongodb";
import {authUser} from "../../helpers/authUser.js";
import {AdminEntry, type User} from "../../../../shared/objects/user.js";
import {FetchResponse} from "../../../../shared/objects/api.js";

export default function (app: Express, usersDb: Collection<User>) {
	app.post("/api/tests/admin", async (request, response) => {
		const user = await authUser(request);

		if (!user) {
			response.status(400).json(new FetchResponse(null, {message: "User doesn't exist"}));
			return;
		}

		const dbResponse = await usersDb.findOneAndUpdate(
			{"data.id": user.data.id},
			{$set: {"data.permissions.admin": new AdminEntry(user.data.id, user.data.name)}}
		);

		if (!dbResponse.ok) {
			response.status(500).json(new FetchResponse(null, {message: "Database update failed"}));
			return;
		}

		response.status(200).end();
	});

	app.delete("/api/tests/admin", async (request, response) => {
		const user = await authUser(request);
		if (!user) {
			response.status(400).json(new FetchResponse(null, {message: "User doesn't exist"}));
			return;
		}

		const dbResponse = await usersDb.findOneAndUpdate(
			{"data.id": user.data.id},
			{$set: {"data.permissions.admin": undefined}}
		);

		if (!dbResponse.ok) {
			response.status(500).json(new FetchResponse(null, {message: "Database update failed"}));
			return;
		}

		response.status(200).end();
	});
}
