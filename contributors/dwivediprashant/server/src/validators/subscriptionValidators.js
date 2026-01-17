const Joi = require("joi");

const createSubscriptionSchema = Joi.object({
  name: Joi.string().trim().min(1).required(),

  amount: Joi.number().positive().required(),

  billingCycle: Joi.string().valid("monthly", "yearly").required(),

  renewalDate: Joi.date().iso().required(),

  category: Joi.string()
    .valid(
      "entertainment",
      "productivity",
      "utilities",
      "education",
      "health",
      "finance",
      "other"
    )
    .required(),

  isTrial: Joi.boolean().optional(),

  source: Joi.string().valid("manual", "email").optional(),

  notes: Joi.string().optional().allow(""),
});

module.exports = {
  createSubscriptionSchema,
};
