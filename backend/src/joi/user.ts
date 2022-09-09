import Joi from "joi";
import * as Schema from "./post";
import * as Class from "../../objects/user";

const UserData = Joi.object<Class.UserData>({
  id: Joi.string().required(),
  authKey: Joi.string().required(),
  name: Joi.string()
    .required()
    .alphanum()
    .min(3)
    .max(20),
  about: Joi.string()
    .required()
    .max(200),
  drafts: Joi.array()
    .required()
    .items(Joi.object({
      title: Schema.Node.extract("title"),
      body: Schema.Node.extract("body"),
    }))
    .max(3),
  configPresets: Joi.object({
    name: Joi.string()
      .max(20),
    config: Schema.PostConfig // should exclude the "access" property, but waiting on a conclusion for this issue i opened (and it wouldn't be terrible to not exclude it in the meanwhile): https://github.com/hapijs/joi/issues/2832
  }),
}).required();

export {
  UserData,
};