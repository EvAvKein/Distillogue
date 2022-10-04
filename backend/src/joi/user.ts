import Joi from "joi";
import * as UserClass from "../../../shared/objects/user.js";
import * as SharedSchema from "./_shared.js"

const UserAuth = Joi.object<UserClass.UserAuth>({
  provider: Joi.string()
    .required(),
  key: Joi.string()
    .required(),
}).required();

const UserSession = Joi.object<UserClass.UserSession>({
  name: Joi.string(),
  key: Joi.string()
    .required(),
}).required();

const UserData = SharedSchema.User.UserData;

export {
  UserAuth,
  UserSession,
  UserData,
};