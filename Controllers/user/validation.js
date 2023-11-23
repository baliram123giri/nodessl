const Joi = require("joi");

const login_validation = Joi.object({
    email:Joi.string().trim().email().required("email is required"),
    password:Joi.string().trim().required("password is required"),
})

const forgot_password_validation = Joi.object({
    token:Joi.string().trim().required("token is required"),
    password: Joi.string().min(8)
    .regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]+$/)
    .message(
        'Password must be at least 8 characters long and contain at least one alphabetic character, one digit, and one special character (@$!%*#?&).'
    )
    .required()
})

module.exports = {
    login_validation,
    forgot_password_validation,
}
