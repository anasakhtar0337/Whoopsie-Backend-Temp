
module.exports = (sequelize, Sequelize) => {

    const Reset_Passwords = sequelize.define("reset_passwords", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        email: {
            type: Sequelize.STRING(50),
            allowNull: false,
            references: {
                model: require("./User.js")(sequelize, Sequelize),
                key: 'email'
            }
        },
        token: {
            type: Sequelize.TEXT,
            allowNull: false
        },
        deletedAt: {
            type: Sequelize.DATE,
            allowNull: true
        }
    }, {
        onDelete: 'cascade',
    });

    return Reset_Passwords;
}