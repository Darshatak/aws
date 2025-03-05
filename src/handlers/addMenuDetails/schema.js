const { Joi } = require("common-layer/utils/packageExports.js");
const { join } = require("path");

let schema = Joi.object().keys({
  reqtype: Joi.string().required(),
  menuID: Joi.number().when("reqtype", {
    is: "u" || "d" || "g",
    then: Joi.required(),
    otherwise: Joi.number().allow(null),
  }),
  mspID: Joi.number().when("reqtype", {
    is: "s",
    then: Joi.required(),
    otherwise: Joi.number().allow(null),
  }),
  title: Joi.string().when("reqtype", {
    is: "s",
    then: Joi.required(),
    otherwise: Joi.string().allow(null),
  }),
  type: Joi.string().when("reqtype", {
    is: "s",
    then: Joi.required(),
    otherwise: Joi.string().allow(null),
  }),
  quantity: Joi.number().when("reqtype", {
    is: "s",
    then: Joi.required(),
    otherwise: Joi.number().allow(null),
  }),
  price: Joi.number().when("reqtype", {
    is: "s",
    then: Joi.required(),
    otherwise: Joi.number().allow(null),
  }),
  takeaway: Joi.number().when("reqtype", {
    is: "s",
    then: Joi.required(),
    otherwise: Joi.number().allow(null),
  }),
  status: Joi.string().when("reqtype", {
    is: "u" || "s",
    then: Joi.required(),
    otherwise: Joi.string().allow(null),
  }),
  // menuCatgeory: Joi.string().when("reqtype", {
  //   is: "s",
  //   then: Joi.required(),
  //   otherwise: Joi.string().allow(null),
  // }),
  menuNotes: Joi.string().allow(""),
  menu: Joi.array()
    .items(
      Joi.object({
        menuDetailsID: Joi.number().when("reqtype", {
          is: "d",
          then: Joi.required(),
          otherwise: Joi.number().allow(null),
        }),
        menuCatID: Joi.number().when("reqtype", {
          is: "s",
          then: Joi.required(),
          otherwise: Joi.number().allow(null),
        }),
        menuItemID: Joi.number().when("reqtype", {
          is: "s",
          then: Joi.required(),
          otherwise: Joi.number().allow(null),
        }),
        menuQTY: Joi.number().when("reqtype", {
          is: "s",
          then: Joi.required(),
          otherwise: Joi.number().allow(null),
        }),
        menuTag: Joi.string().when("reqtype", {
          is: "s",
          then: Joi.required(),
          otherwise: Joi.string().allow(null),
        }),
      })
    )
    .when("reqtype", {
      is: "s",
      then: Joi.required(),
      otherwise: Joi.array().allow(null),
    }),
});

module.exports = schema;
