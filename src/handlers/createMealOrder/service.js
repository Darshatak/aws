const {
  sequelize,
  Sequelize,
  QueryTypes,
} = require("common-layer/utils/SequelizeWriteConnection");

const admin = require("common-layer/utils/notificationUtility");

const currentDate = new Date();
const formattedDate = currentDate.toISOString().slice(0, 19).replace("T", " ");
const sysdate = [formattedDate];

exports.createMealOrder = async (parameter) => {
  try {
    let response = {
      status: "",
      statusCode: "",
      message: "",
    };

    console.log("Inside createMealOrder method");

    let result = await getConsumerBalance(parameter.userID);
    let userBalance = result?.[0]?.TR_BAL;
    console.log("User current balance = ", userBalance);
    console.log("Ordered Amount = ", parameter.finalAmount);

    if (userBalance >= parameter.finalAmount) {
      result = await insertIntoOrder(parameter);

      if (result.result[1] == 1) {
        parameter.orderID = result.orderID;
        parameter.balance = userBalance - parameter.finalAmount;
        console.log("parameter.balance ==", parameter.balance);
        result = await insertToTransaction(parameter);

        if (result[1] == 1) {
          response.status = "SUCCESS";
          response.statusCode = 200;
          response.message = "Order Placed Successfully";

          // Send email notification if order is successfully placed
          await sendEmailNotification(parameter);
          
        } else {
          response.status = "Failure";
          response.statusCode = 500;
          response.message = "Transaction failed at TB_CONS_TRANSACTION";
        }
      } else {
        response.status = "Failure";
        response.statusCode = 500;
        response.message = "Transaction failed at insertIntoOrder";
      }
    } else {
      response.status = "Failure";
      response.statusCode = 500;
      response.message = "Order Amount is greater than account balance";
    }
    console.log("response.message = ", response.message);
    await sendPushNotification(parameter.mspID, parameter.orderID);
    return response;
  } catch (error) {
    throw error;
  }
};

const insertIntoOrder = async (insertData) => {
  try {
    console.log("Inside insertIntoOrder method");
    let orderStatus = await findOrderStatus(insertData.mspID);
    console.log("orderStatus ",orderStatus );
    let query = `INSERT INTO TB_ORDER (O_USERID, O_MSPID, O_AMOUNT, O_DISC, O_DISC_TYPE, 
    O_TAKEWAY_CHG, O_DEL_CHG, O_FINAL_AMOUNT, O_CR_DATE, O_STATUS, O_TYPE, O_PLATFM_FEE) 
  VALUES (?,?,?,?,?,?,?,?,?,?,?,?);`;
  console.log("insertData = ", insertData);
    let result = await sequelize.query(query, {
      replacements: [
        insertData.userID,
        insertData.mspID,
        insertData.amount,
        insertData.discount ,
        insertData.pkgID,
        insertData.takeawaycharge,
        insertData.deliveryCharge,
        insertData.finalAmount,
        sysdate,
        orderStatus,
        insertData.ordertype,
        insertData.platformfee,
      ],
      type: QueryTypes.INSERT,
    });

    let orderID = result[0];

    console.log("orderID = ", orderID);
    console.log("insertData.menu.length", insertData.menu.length);
    console.log("insertData.menu = ", insertData.menu);
    for (let i = 0; i < insertData.menu.length; i++) {
      let menuID = insertData.menu[i].menuID;
      let menuItems = insertData.menu[i].menuItems;
      result = await insertIntoOrderDetails(orderID, menuID, menuItems);
    }
    

    return {
      result: result,
      orderID: orderID,
    };
  } catch (error) {
    throw error;
  }
};

const insertIntoOrderDetails = async (orderID, menuID, menuItems) => {
  try {
    console.log("Inside insertIntoOrderDetails method");

    let query = `INSERT INTO TB_ORDER_DETAILS (OD_OID, OD_MENUID, OD_MENUITEMS) 
      VALUES (?,?,? );`;
    let result = await sequelize.query(query, {
      replacements: [orderID, menuID, menuItems],
      type: QueryTypes.INSERT,
    });
    console.log(query);

    return result;
  } catch (error) {
    throw error;
  }
};

const insertToTransaction = async (insertData) => {
  try {
    console.log("Inside insertToTransaction method");
    console.log("parameter.orderID = ", insertData.orderID);

    let query = `INSERT INTO TB_CONS_TRANSACTION (TR_USERID, TR_SRC_ID, TR_CREDIT, TR_DEBIT, TR_BAL, TR_CR_DATE) 
    VALUES (?,?,?,?,?,?)`;
    let result = await sequelize.query(query, {
      replacements: [
        insertData.userID,
        insertData.orderID,
        0,
        insertData.finalAmount,
        insertData.balance,
        sysdate,
      ],
      type: QueryTypes.INSERT,
    });
    console.log(query);

    return result;
  } catch (error) {
    throw error;
  } 
};

const getConsumerBalance = async (userID) => {
  try {
    console.log("Inside getConsumerBalance method");
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
  } catch (error) {
    throw error;
  }
};

const sendPushNotification = async (mspID, orderID) => {
  try {
    let title = "Order Received.";
    let message = `You have received order ${orderID}. Please handle.`;
    let query = `select FCM_TOKEN from TB_FCM_TOKENS WHERE FCM_USRID in (select MSP_USRID from TB_MSP where MSP_ID = ?) 
    ORDER BY FCM_CR_DT DESC limit 1;`;
    let result = await sequelize.query(query, {
      replacements: [mspID],
      type: QueryTypes.SELECT,
    });
    console.log("message", message);

    console.log(query);

    console.log("result", result);

    let token = result?.[0]?.FCM_TOKEN;

    console.log("token = ", token);

    if (result.length != 0) {
      let response = await admin.sendNotification({ token, title, message });
    
      console.log("send notification response = ", response);
      return true;
    } else {
      return false;
    }
  } catch (error) {
    throw error;
  }
};

const findOrderStatus = async (mspID) => {
  try {
    console.log("Inside findOrderStatus method");
    let query = `SELECT
  COUNT(*) < (
      SELECT MSP_AUTO_CNFM
      FROM TB_MSP
      WHERE MSP_ID = ?
  ) AS AUTOCONFIRM
FROM TB_ORDER 
WHERE O_MSPID = ? AND DATE(O_CR_DATE) = CURDATE();`;
    let result = await sequelize.query(query, {
      replacements: [mspID, mspID],
      type: QueryTypes.SELECT,
    });

    console.log("result?.[0]?.AUTOCONFIRM =",result?.[0]?.AUTOCONFIRM);

    if (result?.[0]?.AUTOCONFIRM == 1) {
      return "CONFIRMED";
    } else return "PENDING";

   

    //return result;
  } catch (error) {
    throw error;
  }
};

// Function to send email notification using AWS SES
const sendEmailNotification = async (orderDetails) => {
  const emailParams = {
    Source: "no-reply@yourdomain.com", // Change this to a verified SES email address
    Destination: {
      ToAddresses: ["jeeva7777@gmail.com"],
    },
    Message: {
      Subject: {
        Data: "Order Confirmation - Khana Anywhere",
      },
      Body: {
        Text: {
          Data: `Hello,

Your order has been successfully placed with the following details:

Customer Name: ${orderDetails.userID}
MSP Name: ${orderDetails.mspID}
Order ID: ${orderDetails.orderID}
Order Amount: ${orderDetails.finalAmount}
Order Date & Time: ${formattedDate}

Thank you for using Khana Anywhere!`,
        },
      },
    },
  };

  try {
    await ses.sendEmail(emailParams).promise();
    console.log("Email sent successfully to jeeva7777@gmail.com");
  } catch (error) {
    console.error("Failed to send email", error);
  }
};