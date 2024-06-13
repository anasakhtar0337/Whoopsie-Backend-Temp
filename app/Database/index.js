const dbConfig = require("../config/db.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    port: dbConfig.PORT,
    dialect: dbConfig.DIALECT,
    operatorsAliases: 0,

    pool: {
        max: dbConfig.pool.max,
        min: dbConfig.pool.min,
        acquire: dbConfig.pool.acquire,
        idle: dbConfig.pool.idle
    }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;


/**Import All Models */
db.users = require("./User.js")(sequelize, Sequelize);
db.user_api_tokens = require("./UserApiTokens.js")(sequelize, Sequelize);
db.user_otp = require("./UserOTP.js")(sequelize, Sequelize);
db.social_user = require("./SocialUser.js")(sequelize, Sequelize);
db.user_groups = require("./UserGroups.js")(sequelize, Sequelize);
db.reset_passwords = require("./ResetPasswords.js")(sequelize, Sequelize);



/**User Api Token Models Relationships Or Assosiaction */
db.users.hasMany(db.user_api_tokens, { foreignKey: "slug", sourceKey: 'slug' });
db.user_api_tokens.belongsTo(db.users, {
    foreignKey: "slug",
    targetKey: 'slug'
}, {
    onDelete: 'cascade',
    onUpdate: 'no action'
});



/*User Groups Model Relation */
db.user_groups.hasMany(db.users, { foreignKey: "user_type", sourceKey: 'type' });
db.users.belongsTo(db.user_groups, {
    foreignKey: "user_type",
    targetKey: 'type'
}, {
    onDelete: 'cascade',
    onUpdate: 'no action'
});


/*Reset Password Model Relation */
db.users.hasMany(db.reset_passwords, { foreignKey: "email", sourceKey: 'email' });
db.reset_passwords.belongsTo(db.users, {
    foreignKey: "email",
    targetKey: 'email'
}, {
    onDelete: 'cascade',
    onUpdate: 'no action'
});

module.exports = db;
