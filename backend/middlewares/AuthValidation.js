import Joi from "joi";

const signupValidation = (req, res, next) => {
    const schema = Joi.object({
        name: Joi.string().min(3).max(100).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).max(100).required(),
        role: Joi.string()
            .valid("customer", "electrician", "plumber", "carpenter", "house maid")
            .required(),
        dateOfBirth: Joi.string().required(),
  nidImageUrl: Joi.string().uri().required(),
  nidImagePublicId: Joi.string().required(),

    location: Joi.object({
      lat: Joi.number().required(),
      lng: Joi.number().required(),
      address: Joi.string().min(3).required(),
    }).required(),
  });

    const { error } = schema.validate(req.body);
    if (error) {
        console.error("Signup validation error:", error);
        return res.status(400).json({ message: "Bad request", error });
    }

    next();
};

const loginValidation = (req, res, next) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(6).max(100).required(),
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: "Bad request", error });
    }

    next();
};

export { signupValidation, loginValidation };