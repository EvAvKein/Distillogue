import {users} from "../../src/mongo.js";

const admins = await users
	.find({admin: {}}, {projection: {["data.drafts"]: false, ["data.presets"]: false, ["data.contacts"]: false}})
	.toArray();

const conciseAdmins = admins.map((adminUser) => {
	return adminUser.data.permissions.admin;
});

console.table(conciseAdmins);
