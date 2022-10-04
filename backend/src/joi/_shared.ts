// file created as a solution for circular-reference errors on runtime
import Joi from "joi";
import * as PostClass from "../../../shared/objects/post.js";
import * as UserClass from "../../../shared/objects/user.js";

const trueOrNone = Joi.valid(true);
const Post = {
  Node: {
    title: Joi.string()
      .required()
      .min(8)
      .max(100),
    body: Joi.string()
      .required()
      .min(50)
      .max(2500),
  },

  PostConfig: Joi.object<PostClass.PostConfig>({
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
  }).required(),
};

const User = {
  UserData: Joi.object<UserClass.UserData>({
    id: Joi.string().required(),
    name: Joi.string()
      .required()
      .alphanum()
      .min(3)
      .max(20),
    drafts: Joi.array()
      .required()
      .items(Joi.object({
        title: Post.Node.title,
        body: Post.Node.title,
      }))
      .max(3),
    configPresets: Joi.object({
      name: Joi.string()
        .max(20),
      config: Post.PostConfig // should exclude the "access" property, but waiting on a conclusion for this issue i opened (and it wouldn't be terrible to not exclude it in the meanwhile): https://github.com/hapijs/joi/issues/2832
    }),
  }).required(),
};

export {
  Post,
  User,
};