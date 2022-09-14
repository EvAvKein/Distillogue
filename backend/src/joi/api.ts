import Joi from "joi";
import * as Class from "../../objects/api";
import * as UserSchema from "./user";
import * as PostSchema from "./post";
import {arrOfEditableUserData} from "../../objects/user";
import {arrOfInteractionTypes} from "../../objects/api";

const UserCreationRequest = Joi.object<Class.UserCreationRequest>({
  username: UserSchema.UserData.extract("name"),
}).required();

const UserPatchRequest = Joi.object<Class.UserPatchRequest>({
  dataName: Joi.valid(...arrOfEditableUserData)
    .required(),
  newValue: Joi.alternatives()
    .required()
    .when("dataName", {is: "name",
      then: UserSchema.UserData.extract("name")
    })
    .when("dataName", {is: "drafts",
      then: UserSchema.UserData.extract("drafts")
    })
    .when("dataName", {is: "configPresets",
      then: UserSchema.UserData.extract("configPresets")
    })
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
  config: PostSchema.PostConfig,
  nodePath: Joi.array()
    .items(Joi.string())
}).required();

const NodeInteractionRequest = Joi.object<Class.NodeInteractionRequest>({
  nodePath: Joi.array()
    .required()
    .items(Joi.string()),
  interactionType: Joi.valid(...arrOfInteractionTypes)
    .required(),
  interactionData: Joi.alternatives()
    .required()
    .when("interactionType", {is: "reply",
      then: NodeCreationRequest.required()
    })
    .when("interactionType", {is: "vote",
      then: {
        voteDirection: Joi.valid(["up", "down"])
          .required(),
        newVoteStatus: Joi.boolean()
          .required()
      }
    })
}).required();


export {
  UserCreationRequest,
  UserPatchRequest,
  NodeCreationRequest,
  NodeInteractionRequest,
};