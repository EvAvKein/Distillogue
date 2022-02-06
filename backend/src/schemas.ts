import Joi from "joi";

const User = Joi.object({
  name: Joi.string()
    .pattern(/^[A-z_-']+$/)
    .min(3)
    .max(20)
    .required(),
  suffixNumeral: Joi.string() // not a number type because it isn't possible to set a digit count
    .pattern(/^[0-9]+$/)
    .length(5)
    .required(),
  roleScore: Joi.number()
    .integer()
    .min(-1)
    // -1 = banned, 0 = free user, 1 = paid user, 2 = community moderator (extent TBD), 3 = management
    .max(3)
    .required(),
  public: Joi.boolean(), // undecided about private profiles for now
  postIds: Joi.array()
    .items(Joi.string()),
  settings: {
    
  },
});

const Log = Joi.object({
  id: Joi.string()
    .required(),
  owner: Joi.string()
    .required(),
  description: Joi.string()
    .required(),
  extraContents: Joi.any(),
  creationTime: Joi.number()
    .integer()
    .required(),
});

const Reply = Joi.object({
  id: Joi.string()
    .required(),
  replyingUser: Joi.string()
    .required(),
  repliedUser: Joi.string() // might be unnecessary
    .required(),
  creationTime: Joi.number()
    .integer()
    .required(),
  body: Joi.string()
    .min(250)
    .max(5000)
    .required(),
  lastActiveUnix: Joi.number()
    .integer()
    .required(),
  history: Joi.array(),
  replies: Joi.array()
    .has(() => {return Reply}),
  locked: Joi.boolean()
});

const Post = Joi.object({
  id: Joi.string()
    .required(),
  owner: Joi.string()
    .required(),
  creationUnix: Joi.number()
    .integer()
    .required(),
  title: Joi.string()
    .min(10)
    .max(90)
    .required(),
  body: Joi.string()
    .min(250)
    .max(5000)
    .required(),
  history: Joi.array(),
  replies: Joi.array()
    .has(Reply),
  lastActiveUnix: Joi.number()
    .integer()
    .required(),
  participants: Joi.array()
    .has(User)
    .required(),
  public: Joi.boolean()
});

export default {
  User,
  Log,
  Reply,
  Post,
};