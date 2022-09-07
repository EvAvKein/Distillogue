import Joi from "joi";
import * as Class from "../../objects/post";

const trueOrNone = Joi.boolean().valid(true);

const PostConfig = Joi.object<Class.PostConfig>({
  access: Joi.object({
    public: trueOrNone,
  }),
  timestamps: Joi.object({
    posted: trueOrNone,
    interacted: trueOrNone,
  }),
  votes: Joi.object({
    up: trueOrNone,
    down: trueOrNone,
    anon: trueOrNone,
  }),
});


export {
  PostConfig,
};