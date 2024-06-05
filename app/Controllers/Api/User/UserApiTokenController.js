const _ = require("lodash")

const RestController = require("../../RestController");
const { validateAll } = require("../../../Helper");

class UserApiTokenController extends RestController {

    constructor() {
        super("UserApiToken")
        this.request;
        this.response;
        this.params = {};
    }

    async validation(action, id = 0) {
        let validator = [];
        let rules;

        switch (action) {
            case "store":
                break;
            case "update":
                rules = {
                    device_token: 'required',
                }
                validator = await validateAll(this.request.body, rules)
                break;
        }
        return validator;
    }

    async beforeUpdateLoadModel() {
        const token = this.request.user.user_api_tokens
        this.params.id = token.length ? token[0].slug : ''
    }

    async afterUpdateLoadModel() {
        this.__collection = false;
        return {}
    }

}

module.exports = UserApiTokenController