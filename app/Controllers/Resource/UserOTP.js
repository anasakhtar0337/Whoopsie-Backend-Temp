const _ = require("lodash")

class UserOTP {

    static async initResponse(data, request) {
        if (_.isEmpty(data))
            return {};


        let response = this.jsonSchema(data, request)

        return response;

    }


    static jsonSchema(record, request) {

        return {
            "slug": record.slug,
            "email": record.email,
            "mobile_no": record.mobile_no,
        }
    }
}

module.exports = UserOTP