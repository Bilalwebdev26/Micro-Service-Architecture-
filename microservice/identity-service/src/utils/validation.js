import joi from "joi";

export const validationRegistration = (data) => {
  const schema = joi.object({
    username: joi.string().alphanum().min(3).max(50).required(),
    email: joi.string().email().required(),
    password: joi.string().min(6).max(50).required(),
  });
  return schema.validate(data);//automatically pass if all true and automatically false if any error found
};
