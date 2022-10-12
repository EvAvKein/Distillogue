import Joi from "joi";
import * as Class from "../../../shared/objects/api.js";
import * as SharedSchema from "./_shared.js"
import {editableUserData, arrOfEditableUserData} from "../../../shared/objects/user.js";
import {arrOfInteractionTypes} from "../../../shared/objects/api.js";

const UserCreationRequest = Joi.object<Class.UserCreationRequest>({
  username: SharedSchema.User.UserData.extract("name"),
}).required();

const UserPatchRequest = Joi.object<Class.UserPatchRequest<editableUserData>>({
  dataName: Joi.valid(...arrOfEditableUserData)
    .required(),
  newValue: Joi
    .required()
    .when("dataName", {is: "name",
      then: SharedSchema.User.UserData.extract("name")
    })
    .when("dataName", {is: "drafts",
      then: SharedSchema.User.UserData.extract("drafts")
    })
    .when("dataName", {is: "configPresets",
      then: SharedSchema.User.UserData.extract("configPresets")
    })
}).required();

const UserPatchRequestArray = Joi.array<Class.UserPatchRequest<editableUserData>[]>()
// currently (joi v17.5.0) it doesn't seem possible to properly type this. i'd submit an issue asking about it (because disccussions aren't available for the repo), but i already have a different one there which is the second latest (as of 17.9.22) and don't wanna be too spammy
  .required()
  .min(1)
  .items(UserPatchRequest);

const NodeCreationRequest = Joi.object<Class.NodeCreationRequest>({
  invitedOwnerIds: Joi.array()
    .items(Joi.string()),
  title: SharedSchema.Post.Node.title,
  body: SharedSchema.Post.Node.body,
  deletedDraftIndex: Joi.number()
    .integer()
    .greater(-1)
    .less(3),
  config: SharedSchema.Post.PostConfig
    .optional(),
  nodePath: Joi.array()
    .min(1)
    .items(Joi.string())
}).required();

const NodeInteractionRequest = Joi.object<Class.NodeInteractionRequest>({
  nodePath: Joi.array()
    .required()
    .min(1)
    .items(Joi.string()),
  interactionType: Joi.valid(...arrOfInteractionTypes)
    .required(),
  interactionData: Joi
    .required()
    .when("interactionType", {is: "reply",
      then: NodeCreationRequest.required()
    })
    .when("interactionType", {is: "vote",
      then: Joi.object({
        voteDirection: Joi.valid("up", "down")
          .required(),
        newVoteStatus: Joi.boolean()
          .required()
      }).required()
    })
}).required();


export {
  UserCreationRequest,
  UserPatchRequest, UserPatchRequestArray,
  NodeCreationRequest,
  NodeInteractionRequest,
};