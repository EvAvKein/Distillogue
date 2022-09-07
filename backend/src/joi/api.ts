import Joi from "joi";
import * as Class from "../../objects/api";
import * as Schema from "./post";
import {arrOfEditableUserData} from "../../objects/user";

const UserCreationRequest = Joi.object<Class.UserCreationRequest>({
  username: Joi.string()
    .required()
    .min(3)
    .max(20)
    .alphanum()
}).required();

const UserPatchRequest = Joi.object<Class.UserPatchRequest>({
  dataName: Joi.string()
    .required()
    .valid(...arrOfEditableUserData),
  newValue: Joi.any() // temp
    .required()
}).required();

const NodeCreationRequest = Joi.object<Class.NodeCreationRequest>({
  invitedOwnerIds: Joi.array()
    .items(Joi.string()),
  title: Joi.string()
    .required()
    .min(8)
    .max(100),
  body: Joi.string()
    .required()
    .min(50)
    .max(2500),
  deletedDraftIndex: Joi.number()
    .integer()
    .greater(-1)
    .less(3),
  config: Schema.PostConfig,
  nodePath: Joi.array()
    .items(Joi.string())
}).required();

const NodeInteractionRequest = Joi.object<Class.NodeInteractionRequest>({
  nodePath: Joi.array()
    .required()
    .items(Joi.string()),
  interactionType: Joi.object() // temp
    .required(),
  interactionData: Joi.object() // temp
    .required()
}).required();


export {
  UserCreationRequest,
  UserPatchRequest,
  NodeCreationRequest,
  NodeInteractionRequest,
};