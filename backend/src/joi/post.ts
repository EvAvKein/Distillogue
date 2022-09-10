import Joi from "joi";
import * as Class from "../../objects/post";
import * as ApiSchema from "./api";
import * as UserSchema from "./user";

const trueOrNone = Joi.valid(true);
const userIdArray = Joi.array()
  .required()
  .items(UserSchema.UserData.extract("id"));

const PostConfig = Joi.object<Class.PostConfig>({
  access: Joi.object({
    public: trueOrNone,
  }),
  timestamps: Joi.object({
    interacted: trueOrNone,
  }),
  votes: Joi.object({
    up: trueOrNone,
    down: trueOrNone,
    anon: trueOrNone,
  }),
}).required();

const NodeStats = Joi.object<Class.NodeStats>({
  timestamps: Joi.object({
    posted: Joi.number(),
    interacted: Joi.number()
  }),
  votes: Joi.object({
    up: userIdArray,
    down: userIdArray,
    anon: Joi.valid(true),
  }),
}).required();

const Node = Joi.object<Class.Node>({
  ownerIds: userIdArray,
  id: Joi.string()
    .required(),
  title: ApiSchema.NodeCreationRequest.extract("title"),
  body: ApiSchema.NodeCreationRequest.extract("body"),
  replies: Joi.array()
    .required()
    .items(Joi.link("#Node")),
  stats: NodeStats,
  locked: Joi.valid(true),
  past: Joi.array()
    .items({
      title: Joi.link("#Node").extract("title"),
      body: Joi.link("#Node").extract("body"),
    }),
}).required().id("Node");

export {
  PostConfig,
  Node,
};