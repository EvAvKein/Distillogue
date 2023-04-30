import {promises as fs} from "node:fs";
import {UserData} from "../../../shared/objects/user.js";
import {users} from "../../src/mongo.js";

const newAdminsList: {id: UserData["id"]; name: string}[] = JSON.parse(await fs.readFile("../admins.json", "utf-8"));
const newAdminIdsList = newAdminsList.map((admin) => admin.id);

const currentAdmins = await users
	.find(
		{"data.permissions.admin": {}},
		{projection: {["data.drafts"]: false, ["data.presets"]: false, ["data.contacts"]: false}}
	)
	.toArray();
const currentAdminIds = currentAdmins.map((admin) => admin.data.id);

const adminsForRemoval = currentAdmins.filter((admin) => !newAdminIdsList.includes(admin.data.id));
const adminsForAssignment = newAdminIdsList.filter((adminId) => !currentAdminIds.includes(adminId));

if (adminsForRemoval.length) {
	const removalsOutcome = await users.updateMany({"data.id": {$or: adminsForRemoval}}, {admin: undefined});
	if (!removalsOutcome.modifiedCount) {
		console.error(`ERROR: failed to remove ${adminsForRemoval.length - removalsOutcome.modifiedCount} admins`);
	}
}

if (adminsForAssignment.length) {
	const assignmentOutcome = await users.updateMany({"data.id": {$or: adminsForAssignment}}, {admin: true});
	if (!assignmentOutcome.modifiedCount) {
		console.error(`ERROR: failed to assign ${adminsForAssignment.length - assignmentOutcome.modifiedCount} admins`);
	}
}
