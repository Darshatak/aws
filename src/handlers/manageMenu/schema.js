const { Joi } = require('common-layer/utils/packageExports.js');

let schema = Joi.object().keys({
    reqtype: Joi.string().required(),
    menuname: Joi.string().when("type", {
        is: "u",
        then: Joi.required(),
        otherwise: Joi.string().allow("", null),
    }),
    menutype: Joi.string().when("type", {
        is: "u",
        then: Joi.required(),
        otherwise: Joi.string().allow("", null),
    }),
    quantity: Joi.string().when("type", {
        is: "u",
        then: Joi.required(),
        otherwise: Joi.string().allow("", null),
    }),
    price: Joi.string().when("type", {
        is: "u",
        then: Joi.required(),
        otherwise: Joi.string().allow("", null),
    }),
    takeaway: Joi.string().when("type", {
        is: "u",
        then: Joi.required(),
        otherwise: Joi.string().allow("", null),
    }),
    status: Joi.string().when("type", {
        is: "u",
        then: Joi.required(),
        otherwise: Joi.string().allow("", null),
    }),
    date: Joi.string().when("type", {
        is: "u",
        then: Joi.required(),
        otherwise: Joi.string().allow("", null),
    }),
    id: Joi.string().when("type", {
        is: "u",
        then: Joi.required(),
        otherwise: Joi.string().allow("", null),
    })

})

module.exports = schema;