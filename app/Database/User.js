const { LOGIN_TYPE } = require('../config/enum.js')

module.exports = (sequelize, Sequelize) => {

    const User = sequelize.define("users", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_type: {
            type: Sequelize.STRING(50),
            allowNull: false,
            references: {
                model: require("./UserGroups.js")(sequelize, Sequelize),
                key: 'type'

            },
        },
        name: {
            type: Sequelize.STRING(50),
            allowNull: true
        },
        username: {
            type: Sequelize.STRING(50),
            allowNull: true
        },
        slug: {
            type: Sequelize.STRING(100),
            allowNull: false,
            unique: true
        },
        email: {
            type: Sequelize.STRING(250),
            allowNull: true,
            unique: true
        },
        mobile_no: {
            type: Sequelize.STRING(20),
            allowNull: true,
            unique: true
        },
        password: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        image_url: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        status: {
            type: Sequelize.BOOLEAN,
            defaultValue: true,
        },
        is_mobile_verify: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,

        },
        mobile_verifyAt: {
            type: Sequelize.DATE,
            allowNull: true
        },
        is_activated: {
            type: Sequelize.BOOLEAN,
            defaultValue: true,
        },
        is_blocked: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
        },
        login_type: {
            type: Sequelize.STRING(30),
            defaultValue: LOGIN_TYPE.CUSTOM,
            allowNull: true,
        },
        deletedAt: {
            type: Sequelize.DATE,
            allowNull: true
        }
    });

    return User;
}