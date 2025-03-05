const {
    sequelize,
    Sequelize,
    QueryTypes,
  } = require("common-layer/utils/SequelizeWriteConnection");

  const currentDate = new Date();
  const formattedDate = currentDate.toISOString().slice(0, 19).replace("T", " ");
  const sysdate = [formattedDate];
  
  
  exports.getRechargeDetails = async (parameter) => {
    try {
      
      //let t = await sequelize.transaction();
      let query = `SELECT R_AMOUNT,R_DATE, R_STATUS
      FROM TB_RECHARGE
      WHERE R_USERID = ? order by R_ID desc `;
      let results = await sequelize.query(query, {
        replacements: [parameter.userID
        ],
        type: QueryTypes.SELECT,
      });
  
      return results;
    } catch (error) {
      throw error;
    }
  };
  