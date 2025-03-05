let { HTTP_CODE, getResponseObject } = require("common-layer/utils/helper.js");
let service = require("./service");
let Schema = require("./schema");

exports.handler = async (event, context) => {
  try {
    let parameter = JSON.parse(event.body);

    let validationSchema = await Schema.validate(parameter);

    if (validationSchema.error) {
      console.log("Please send complete data " + validationSchema.error);
      return getResponseObject(
        false,
        HTTP_CODE.INTERNAL_SERVER_ERROR,
        [],
        validationSchema.error
      );
    }
    console.log("Parameters - ", parameter);
    response = await service.manageRecharge(parameter);
    console.log("statusCode",response.statusCode);
    if (response.statusCode == 200) {
      return getResponseObject(
        true,
        HTTP_CODE.SUCCESS,
        { isValid: true },
        response
      );
    } else {
      return getResponseObject(
        false,
        HTTP_CODE.FAILURE,
        { isValid: true },
        response
      );
    }
  } catch (error) {
    console.log("Error in manageRecharge handler: ", error);
    return getResponseObject(false, HTTP_CODE.INTERNAL_SERVER_ERROR, [], error);
  }
};
