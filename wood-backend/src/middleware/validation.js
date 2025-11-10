const Joi = require('joi');

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
  videoUrl: Joi.string().uri().required(),
});

const createCouponSchema = Joi.object({
  code: Joi.string().required(),
  discountPercentage: Joi.number().integer().min(1).max(100).required(),
  expiryDate: Joi.date().required(),
});

const createSubscriptionSchema = Joi.object({
  couponCode: Joi.string(),
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

module.exports = {
  registerSchema,
  createSeriesSchema,
  createEpisodeSchema,
  createCouponSchema,
  createSubscriptionSchema,
  validationMiddleware,
};
