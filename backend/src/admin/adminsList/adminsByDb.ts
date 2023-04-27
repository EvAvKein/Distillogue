import {users} from "../../mongo";

const admins = await users
	.find({admin: {}}, {projection: {["data.drafts"]: false, ["data.presets"]: false, ["data.contacts"]: false}})
	.toArray();

const conciseAdmins = admins.map((adminUser) => {
	return adminUser.admin!;
});

console.table(conciseAdmins);
