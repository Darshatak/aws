const {
    sequelize,
    Sequelize,
    QueryTypes,
} = require("common-layer/utils/SequelizeWriteConnection");

exports.manageMessDetails = async (parameter) => {
    console.log("Inside manageMessDetails method");
    console.log('reqtype ### ' + parameter.reqtype);
    try {
        let response = {
            result: false,
            msg: "",
        }
        if (parameter.reqtype == "u") {
            let result = await updateMessDetails(parameter);
            response.result = true,
                response.msg = "updated succesfully";
            response.msg = result

        } else if (parameter.reqtype == "g") {
            let result = await getManageMess(parameter);
            response.result = true,
                response.msg = result;
        } else if (parameter.reqtype == "e") {
            let result = editAdminChrg(parameter);
            response.result = true;
            response.msg = result;
        } else {
            return false;
        }
        return response;
    } catch (error) {
        throw error;
    }
};




const getManageMess = async (parameter) => {
    console.log("Inside getmanagemess method");
    try {
        //let t = await sequelize.transaction();
        let query =
            `SELECT 
            ROW_NUMBER() OVER (ORDER BY M.MSP_ID) AS SERIAL_NUMBER,
                    CONCAT(U.U_FNAME, ' ', U.U_LNAME) AS U_FULL_NAME,
                  M.MSP_NAME,
                  U.U_MOBILE,
                  M.MSP_APPROVED,   
                  C.AD_LINE1,
                U.U_USERID,U.U_EMAIL,U.U_DATE,U.U_TYPE,U.U_GENDER,U.U_DOB,
                M.MSP_TYPE,M.MSP_CAPACITY,M.MSP_AUTO_CNFM,M.MSP_DELIVERY,
                M.MSP_BUS_STATUS,M.MSP_LSTRT_HRS,M.MSP_LEND_HRS,M.MSP_DSTRT_HRS,M.MSP_DEND_HRS,M.MSP_INVC_FREQ,
                M.DEL_CHG,M.MSP_APPROVED,B.B_ID,B.B_BANKNAME,B.B_ACCOUNTNUMBER,B.B_ACCOUNTHOLDERNAME,B.B_IFSCCODE,
                AC.ADMIN_CHG,M.MSP_CATEGORY,
                AC.STATUS
            FROM 
                TB_MSP M
            left join 
                TB_USER U ON M.MSP_USRID = U.U_USERID
            left JOIN 
                TB_BANKDETAILS B ON M.MSP_USRID = B.B_USERID
            LEFT JOIN
                  TB_MSP_ADDRESS C ON M.MSP_USRID = C.AD_USERID
            LEFT JOIN
                TB_ADMIN_CHG AC ON M.MSP_ID = AC.MSPID;`;
        let result = await sequelize.query(query, {
            replacements: [parameter],
            type: QueryTypes.SELECT,
        });
        console.log(query);

        return result;
    } catch (error) {
        throw error;
    }
};


const updateMessDetails = async (parameter) => {
    try {
        console.log("Inside updateMessDetails method", parameter);
        console.log("mspID = ", parameter.mspId);
        console.log("status = ", parameter.status);
        console.log("status = ", parameter.category);
        let query = ` UPDATE TB_MSP SET  MSP_APPROVED = ?, MSP_CATEGORY= ? WHERE MSP_ID = ? `;
        let result = await sequelize.query(query, {
            replacements: [
                parameter.status,
                parameter.category,
                parameter.mspId
            ],
            type: QueryTypes.UPDATE,
        });
        console.log(query);
        console.log(result);
        return result;
    } catch (error) {
        throw error;
    }
};


// const editAdminChrg = async (parameter) => {
//     try {
//         console.log("Inside editAdminChrg method", parameter);
//         let query = `UPDATE TB_ADMIN_CHG SET ADMIN_CHG=?, STATUS=? WHERE MSPID=?; `;
//         let result = await sequelize.query(query, {
//             replacements: [
//                 parameter.admin,
//                 parameter.active,
//                 parameter.mspId
//             ],
//             type: QueryTypes.UPDATE,
//         });
//         console.log(query);
//         console.log(result);
//         return result;
//     } catch (error) {
//         throw error;
//     }
// };
