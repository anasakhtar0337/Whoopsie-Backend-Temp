const ROLES = {
    ADMIN: 'ADMIN',
    USER: 'USER',
}

const LOGIN_TYPE = {
    CUSTOM: "custom",
    GOOGLE: "google",
    APPLE: 'apple',
    FACEBOOK: 'facebook'
}

const API_TOKENS_ENUM = {
    ACCESS: "ACCESS",
    RESET: 'RESET',
    UPDATE_NUMBER: 'UPDATE_NUMBER',

}

const OTP_VERIFICATION_TYPE = {
    EMAIL: 'EMAIL',
    MOBILE_NO: 'MOBILE_NO'
}

module.exports = {
    ROLES,
    LOGIN_TYPE,
    API_TOKENS_ENUM,
    OTP_VERIFICATION_TYPE
}