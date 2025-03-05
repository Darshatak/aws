const {
    sequelize,
    Sequelize,
    QueryTypes,
} = require("common-layer/utils/SequelizeWriteConnection");

const currentDate = new Date();
const formattedDate = currentDate.toISOString().slice(0, 19).replace("T", " ");
const sysdate = [formattedDate];

exports.manageMenu = async (parameter) => {
    console.log("Inside manageMenuDetails method");
    console.log('reqtype ### ' + parameter.reqtype);
    try {
        let response = {
            result: false,
            msg: "",
        }
        if (parameter.reqtype == "u") {
            let result = await updateMenu(parameter);
            response.result = true,
                response.msg = "updated succesfully";
            response.msg = result

        } else if (parameter.reqtype == "g") {
            let result = await getmenu(parameter);
            response.result = true,
                response.msg = result;
        } else if (parameter.reqtype == "s") {
            let result = await insertmenu(parameter);
            response.result = true;
            response.msg = "inserted successfully"

        } else {
            return false;
        }
        return response;
    } catch (error) {
        throw error;
    }
};




const getmenu = async (parameter) => {
    console.log("Inside getmanagemenu method");
    try {
        //let t = await sequelize.transaction();
        let query =
            `SELECT 
            A.M_ID,
            B.MSP_NAME,
            A.M_TITLE,
            A.M_TYPE,
            A.M_QNTY,
            A.M_PRICE,
            A.M_TAKEAWAY_CHG,
            A.M_STATUS,
            A.M_CR_DATE
        FROM
            TB_MENU A
        JOIN
            TB_MSP B ON B.MSP_ID = A.M_MSPID;
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


const updateMenu = async (parameter) => {
    try {
        console.log("Inside updateMenuDetails method");
        console.log("menuID = ", parameter.id);
        // console.log("status = ", parameter.status);
        let query = `UPDATE TB_MENU 
        SET
            M_TITLE = ?,
            M_TYPE = ?,
            M_QNTY = ?,
            M_PRICE = ?,
            M_TAKEAWAY_CHG = ?,
            M_STATUS = ?,
            M_CR_DATE = ?
        WHERE
            M_ID = ?;
        `;
        let result = await sequelize.query(query, {
            replacements: [
                parameter.menuname,
                parameter.menutype,
                parameter.quantity,
                parameter.price,
                parameter.takeaway,
                parameter.status,
                sysdate,
                parameter.id

            ],
            type: QueryTypes.UPDATE,
        });
        console.log(query);

        return result;
    } catch (error) {
        throw error;
    }
};

