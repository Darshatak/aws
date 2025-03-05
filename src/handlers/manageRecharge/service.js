const {
  sequelize,
  Sequelize,
  QueryTypes,
} = require("common-layer/utils/SequelizeWriteConnection");
//const sms = require("common-layer/utils/sendSMS");
const { Axios } = require("common-layer/utils/packageExports.js");
const { apiResponse } = require("common-layer/utils/helper.js");

const currentDate = new Date();
const formattedDate = currentDate.toISOString().slice(0, 19).replace("T", " ");
const sysdate = [formattedDate];

exports.manageRecharge = async (parameter) => {
  console.log("Inside manageRecharge method");

  //let t = await sequelize.transaction();
  try {
    let response;
    if (parameter.type == "init") {
      let result = await insertIntoRecharge(parameter);

      if (result[1] == 1) {
        parameter.rechargeID = result[0];
        //send to cashfree
        let cfResult = await createCFOrderNew(parameter);
        cfResult.rechargeID = result[0];
        console.log("cfResult ", cfResult);

        return cfResult;
      }
    } else if (parameter.type == "final") {
      let result = await updateRecharge(parameter);
      console.log("result updateRecharge = ", result[1]);

      if (result[1] == 1) {
        if (parameter.status == "SUCCESS"){
        result = await insertIntoConTransaction(parameter);
        if (result[1] == 1){
          response = apiResponse.TS200;
        if (parameter.packageID != null && parameter.packageID != "") {
          result = await insertIntoSubPkg(parameter);

          if (result[1] == 1) {
            response = apiResponse.TS200;
          } else {
            response = apiResponse.TF400;
          }
        } 
      } else{
        response = apiResponse.TF500;
      }
      } else {
        response = apiResponse.TS200;
      }
    }else{
      response = apiResponse.TFU500;
    }
    } else {
      (response.statusCode = "500"),
        (response.message =
          "Please send appropriate request type init or final");
    }
    console.log("Message - ", response.message);
    return response;
  } catch (error) {
    throw error;
  }
};

const insertIntoRecharge = async (insertData) => {
  console.log("Inside insertIntoRecharge method");
  let query =
    " INSERT INTO TB_RECHARGE (R_USERID, R_AMOUNT, R_DATE, R_STATUS) VALUES (?,?,?,?)";
  let result = await sequelize.query(query, {
    replacements: [insertData.userID, insertData.amount, sysdate, "INIT"],
    type: QueryTypes.INSERT,
  });
  console.log(query);

  return result;
};

const updateRecharge = async (insertData) => {
  console.log("Inside updateRecharge method");
  let query =
    " UPDATE TB_RECHARGE SET R_STATUS = ?, R_CFID = ?, R_CFNOTES=? WHERE R_ID = ? AND R_USERID = ?";
  let result = await sequelize.query(query, {
    replacements: [
      insertData.status,
      insertData.cfOrderID,
      insertData.cfNotes,
      insertData.rechargeID,
      insertData.userID,
    ],
    type: QueryTypes.UPDATE,
  });
  console.log(query);

  return result;
};

const insertIntoConTransaction = async (insertData) => {
  console.log("Inside insertIntoConTransaction method");
  let result = await getConsumerBalance(insertData.userID);
  console.log("getConsumerBalance results", result);
  let currentBal = 0;
  if (result.length > 0) {
    currentBal = parseInt(result[0].TR_BAL);
  }

  console.log("currentBal = ", currentBal);
  insertData.balance = parseInt(currentBal) + parseInt(insertData.amount);

  let query =
    " INSERT INTO TB_CONS_TRANSACTION (TR_USERID, TR_SRC_ID, TR_CREDIT, TR_DEBIT,TR_BAL, TR_CR_DATE) VALUES (?,?,?,?,?,?)";
  result = await sequelize.query(query, {
    replacements: [
      insertData.userID,
      insertData.rechargeID,
      insertData.amount,
      0,
      insertData.balance,
      sysdate,
    ],
    type: QueryTypes.INSERT,
  });

  return result;
};

const insertIntoSubPkg = async (insertData) => {
  console.log("Inside insertIntoSubPkg method");
  // const startDate = [formattedDate];
  const currentDate = new Date();
  const formattedDate = currentDate
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");
  const sysdate = new Date(formattedDate);
  sysdate.setDate(sysdate.getDate() + insertData.packageVal);
  const packageEndDate = sysdate.toISOString().slice(0, 19).replace("T", " ");

  let query =
    "INSERT INTO TB_SUBS_PKG (SP_USRID, SP_PKGID, SP_SUB_DATE, SP_END_DATE, SP_STATUS, SP_RECID) VALUES (?,?,?,?,?,?)";
  let result = await sequelize.query(query, {
    replacements: [
      insertData.userID,
      insertData.packageID,
      [formattedDate],
      packageEndDate,
      "ACTIVE",
      insertData.rechargeID,
    ],
    type: QueryTypes.INSERT,
  });
  console.log(query);

  return result;
};

const createCFOrderNew = async (parameter) => {
  //Test config
  // const config = {
  //   headers: {
  //     "x-client-id": "4633925ddd0b983949abbc45a93364",
  //     "x-client-secret": "2244d59766c522b9b96b9d07ae105620eeac4102",
  //     "x-request-id": "",
  //     "x-api-version": "2023-08-01",
  //   },
  // };

  //Prod config
  const config = {
    headers: {
      "x-client-id": "91590f12edf8e3c27e11a6ac509519",
      "x-client-secret": "db0722745f07d1ae9234f464a25a50faa9302506",
      "x-request-id": "",
      "x-api-version": "2023-08-01",
    },
  };
  const jsonData = {
    order_id: parameter.rechargeID.toString(),
    order_currency: "INR",
    order_amount: parameter.amount.toString(),
    customer_details: {
      customer_id: "1",
      customer_name: "KhanaAnywhere",
      customer_email: "",
      customer_phone: "1234567897",
    },
    order_meta: {
      notify_url: "https://test.cashfree.com",
    },
    order_note: "some order note here",
  };

  //Test URL
  // const apiUrl = "https://sandbox.cashfree.com/pg/orders";
  //Prod URL
  const apiUrl = "https://api.cashfree.com/pg/orders";
  let cfResponse = {};

  try {
    const response = await Axios.post(apiUrl, jsonData, config);
    cfResponse = {
      statusCode: response.status,
      payment_session_id: response.data.payment_session_id,
      cf_order_id: response.data.cf_order_id,
    };
    return cfResponse;
  } catch (error) {
    cfResponse = {
      statusCode: error.response.status,
      errorMessage: error.response.data.message,
      errorCode: error.response.data.code,
      errorType: error.response.data.type,
    };

    console.log("Error in createCFOrderNew ", error);
    return cfResponse;
  }
};

const getConsumerBalance = async (userID) => {
  console.log("Inside insertIntoRecharge method");
  let query = `SELECT 
  TR_BAL
FROM
  TB_CONS_TRANSACTION
WHERE
  TR_USERID = ?
ORDER BY TR_ID DESC
LIMIT 1;`;
  let result = await sequelize.query(query, {
    replacements: [userID],
    type: QueryTypes.SELECT,
  });
  console.log(query);

  return result;
};
