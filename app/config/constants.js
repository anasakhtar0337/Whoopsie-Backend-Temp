module.exports = {
    PASSWORD_SALT_ROUND: 6,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRY: process.env.JWT_EXPIRY,
    CLIENT_ID: process.env.CLIENT_ID,
    BASE_URL: process.env.BASE_URL,
    FILE_SYSTEM: process.env.FILE_SYSTEM,

    MAIL_SYSTEM: process.env.MAIL_SYSTEM,
    MAIL_API_KEY: process.env.MAIL_API_KEY,
    MAIL_HOST: process.env.MAIL_HOST,
    MAIL_PORT: process.env.MAIL_PORT,
    MAIL_EMAIL: process.env.MAIL_EMAIL,
    MAIL_PASSWORD: process.env.MAIL_PASSWORD,
    MAIL_FROM: process.env.MAIL_FROM,
    EMAIL_VERIFICATION: 0,

    SMS_VERIFICATION: 1,

    PAGINATION_LIMIT: 20,
    LOOKUPS_ID: "79abe42f-ffa0-4699-9e16-d8179a3ecb28",
    STATIC_PAGE_ID: "9b032ad7-bed9-45ac-91e3-75e61d9a4cee",
}