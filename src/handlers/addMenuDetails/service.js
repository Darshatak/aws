const {
  sequelize,
  Sequelize,
  QueryTypes,
} = require("common-layer/utils/SequelizeWriteConnection");

const currentDate = new Date();
const formattedDate = currentDate.toISOString().slice(0, 19).replace("T", " ");
const sysdate = [formattedDate];

exports.addMenuDetails = async (parameter) => {
  console.log("parameter = ", parameter);
  try {
    if (parameter.reqtype == "s") {
      let result = await insertIntoMenu(parameter);
      if (result[1] == 1) {
        return true;
      } else return false;
    }
    if (parameter.reqtype == "u") {
      let result = await updateMenu(parameter);
      console.log("Update result = ", result[1]);
      if (result[1] == 1) {
        return true;
      } else return false;
    } else if (parameter.reqtype == "d") {
      let result = await deleteMenu(parameter);
      // if (result[1] == 1) {
      //   return true;
      // } else return false;
      return true;
    } else if (parameter.reqtype == "g") {
      let result = await getMenuDetails(parameter);
      return result;
    }
  } catch (error) {
    throw error;
  }
};

const insertIntoMenu = async (insertData) => {
  try {
    console.log("Inside insertIntomenu method");
    let query = `INSERT INTO TB_MENU (M_MSPID, M_TITLE, M_TYPE, M_QNTY, M_PRICE, M_TAKEAWAY_CHG,
         M_STATUS, M_CR_DATE, M_NOTES) 
      VALUES (?,?,?,?,?,?,?,?,?);`;
      console.log("query = ", query);
    let result = await sequelize.query(query, {
      replacements: [
        insertData.mspID,
        insertData.title,
        insertData.type,
        insertData.quantity,
        insertData.price,
        insertData.takeaway,
        insertData.status,
        sysdate,
        // insertData.menuCatgeory,
        insertData.menuNotes ?? '',
      ],
      type: QueryTypes.INSERT,
    });

    let menuID = result[0];

    console.log("menuID = ", menuID);

    for (let i = 0; i < insertData.menu.length; i++) {
      let menuItemID = insertData.menu[i].menuItemID;
      let menuQTY = insertData.menu[i].menuQTY;
      let menuTag = insertData.menu[i].menuTag;
      let menuCatID = insertData.menu[i].menuCatID;

      let result = await insertIntoMenuDetails(
        menuID,
        menuCatID,
        menuItemID,
        menuQTY,
        menuTag
      );
    }

    return result;
  } catch (error) {
    throw error;
  }
};

const insertIntoMenuDetails = async (
  menuID,
  menuCatID,
  menuItemID,
  menuQTY,
  menuTag
) => {
  try {
    console.log("Inside insertIntoMenuDetails method");

    let query = `INSERT INTO TB_MENU_DETAILS (MD_MENUID, MD_CATID, MD_ITMID, MD_QTY, MD_TAG) 
        VALUES (?,?,?,?,?);`;
    let result = await sequelize.query(query, {
      replacements: [menuID, menuCatID, menuItemID, menuQTY, menuTag],
      type: QueryTypes.INSERT,
    });
    console.log(query);

    return result;
  } catch (error) {
    throw error;
  }
};

// const updateMenu = async (parameter) => {
//   try {
//     console.log("Inside updateMenu method");

//     let query = `UPDATE TB_MENU SET M_TITLE = ?, M_TYPE =?, M_QNTY = ?, M_PRICE = ?, M_TAKEAWAY_CHG = ?,
//     M_STATUS =?, M_NOTES = ? WHERE M_ID = ?;`;
//     let result = await sequelize.query(query, {
//       replacements: [
//         parameter.title,
//         parameter.type,
//         parameter.quantity,
//         parameter.price,
//         parameter.takeaway,
//         parameter.status,
//         parameter.menuNotes,
//         parameter.menuID
//       ],
//       type: QueryTypes.UPDATE,
//     });
//     console.log(query);

//     for (let i = 0; i < parameter.menu.length; i++) {
//       let menuDetailsID = parameter.menu[i].menuDetailsID;
//       let menuItemID = parameter.menu[i].menuItemID;
//       let menuQTY = parameter.menu[i].menuQTY;
//       let menuTag = parameter.menu[i].menuTag;
//       let menuCatID = parameter.menu[i].menuCatID;
//       let result;
//       if(menuDetailsID != 0) {
//        result = await updateMenuDetails(
//         menuDetailsID,
//         menuCatID,
//         menuItemID,
//         menuQTY,
//         menuTag
//       );
//     } else {
//       result = await insertIntoMenuDetails( parameter.menuID,
//         menuCatID,
//         menuItemID,
//         menuQTY,
//         menuTag);
//     }
//   }
//     return result;
//   } catch (error) {
//     throw error;
//   }
// };

const updateMenu = async (parameter) => {
  try {
    console.log("Inside updateMenu method");

    let query = `UPDATE TB_MENU SET M_STATUS =? WHERE M_ID = ?;`;
    let result = await sequelize.query(query, {
      replacements: [parameter.status, parameter.menuID],
      type: QueryTypes.UPDATE,
    });
    console.log(query);

    return result;
  } catch (error) {
    throw error;
  }
};

const updateMenuDetails = async (
  menuDetailsID,
  menuCatID,
  menuItemID,
  menuQTY,
  menuTag
) => {
  try {
    console.log("Inside updateIntoMenuDetails method");

    let query = `UPDATE TB_MENU_DETAILS SET MD_CATID = ? , MD_ITMID = ?, MD_QTY = ?, MD_TAG = ? WHERE MD_ID =?;`;
    let result = await sequelize.query(query, {
      replacements: [menuCatID, menuItemID, menuQTY, menuTag, menuDetailsID],
      type: QueryTypes.UPDATE,
    });
    console.log(query);

    return result;
  } catch (error) {
    throw error;
  }
};

const deleteMenu = async (parameter) => {
  try {
    console.log("Inside deleteMenu method");

    let query = `UPDATE TB_MENU SET  M_STATUS = 4 WHERE M_ID = ?;`;
    let result = await sequelize.query(query, {
      replacements: [parameter.menuID],
      type: QueryTypes.UPDATE,
    });
    console.log(query);

    return result;
  } catch (error) {
    throw error;
  }
};

const getMenuDetails = async (parameter) => {
  try {
    console.log("Inside getMenuDetails method");

    let query = `SELECT A.*, B.MI_NAME ,C.M_NOTES
    FROM TB_MENU_DETAILS A
    left JOIN TB_MENU_ITEM B ON A.MD_ITMID = B.MI_ID
    left JOIN TB_MENU C ON A.MD_MENUID = C.M_ID
    WHERE A.MD_MENUID = ?`;
    let result = await sequelize.query(query, {
      replacements: [parameter.menuID],
      type: QueryTypes.SELECT,
    });
    console.log(query);

    return result;
  } catch (error) {
    throw error;
  }
};
