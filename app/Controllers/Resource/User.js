const { baseUrl, getImageUrl } = require("../../Helper");
const _ = require("lodash")

class User {

    static async initResponse(data, request) {
        if (_.isEmpty(data))
            return [];

        this.headers = request.headers;
        let response;
        if (Array.isArray(data)) {
            response = []
            for (var i = 0; i < data.length; i++) {
                response.push(this.jsonSchema(data[i], request));
            }
        } else {
            response = this.jsonSchema(data, request)
        }
        return response;

    }


    static jsonSchema(record, request) {
        let image_url = null;
        let blur_image = null;
        let api_token = _.isEmpty(this.headers.authorization)
            ? Buffer.from(request.api_token).toString('base64')
            : Buffer.from(request.authorization).toString('base64');

        return {
            "name": record.name,
            "slug": record.slug,
            "username": record.username,
            "email": record.email,
            "mobile_no": record.mobile_no,
            "api_token": api_token,
            "image_url": getImageUrl(record.image_url),
        }
    }
}

module.exports = User