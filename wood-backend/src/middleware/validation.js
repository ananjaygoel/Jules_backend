const Joi = require('joi');
const mongoose = require('mongoose');

const registerSchema = Joi.object({
  firebaseUid: Joi.string().required(),
  name: Joi.string().required(),
  email: Joi.string().email().required(),
});

const createSeriesSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  genre: Joi.string().required(),
  coverImageUrl: Joi.string().uri().required(),
});

const createEpisodeSchema = Joi.object({
  series: Joi.string().required(),
  episodeNumber: Joi.number().integer().min(1).required(),
  // videoUrl removed since it's now a file upload
});

const createCouponSchema = Joi.object({
  code: Joi.string().required(),
  discountPercentage: Joi.number().integer().min(1).max(100).required(),
  expiryDate: Joi.date().required(),
});

const createSubscriptionSchema = Joi.object({
  couponCode: Joi.string(),
});

const updateUserSchema = Joi.object({
  name: Joi.string(),
  date_of_birth: Joi.date(),
  country: Joi.string(),
  preferred_genres: Joi.array().items(Joi.string()),
  gender: Joi.string().valid('male', 'female', 'other', 'prefer_not_to_say'),
}).unknown(true); // allow extra keys so disallowed fields are ignored upstream

const assignAdminRoleSchema = Joi.object({
  userId: Joi.string().required(),
});

const validationMiddleware = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    next();
  };
};

const validateObjectId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'Invalid ID' });
  }
  next();
};

module.exports = {
  registerSchema,
  createSeriesSchema,
  createEpisodeSchema,
  createCouponSchema,
  createSubscriptionSchema,
  assignAdminRoleSchema,
  updateUserSchema,
  validationMiddleware,
  validateObjectId,
};
