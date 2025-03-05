const {
    sequelize,
    Sequelize,
    QueryTypes,
} = require("common-layer/utils/SequelizeWriteConnection");


exports.getManageConsumer = async (parameter) => {
    console.log("Inside getmanageConsumer method");

    try {
        let query =
            `SELECT 
        ROW_NUMBER() OVER (ORDER BY A.U_USERID desc) AS SERIAL_NUMBER,
        CONCAT(A.U_FNAME, ' ', A.U_LNAME) AS U_FULLNAME,
        A.U_EMAIL,
        A.U_MOBILE,
        A.U_TYPE,
        A.U_DATE,  
        B.AD_LINE
    FROM
        TB_USER A
    JOIN
        TB_CON_ADDRESS B ON B.AD_USERID = A.U_USERID;
        `;
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