const _ = require("lodash")

const { validateAll, validateAsync, compareHash, extractFields, generateHash } = require("../../../Helper/index.js");
const FileHandler = require("../../../Libraries/FileHandler/FileHandler.js");

const RestController = require("../../RestController");
const SocialUser = require("../../../Models/SocialUser.js");
const UserApiToken = require("../../../Models/UserApiToken.js");
const UserOTP = require("../../../Models/UserOTP.js");
const { LOGIN_TYPE } = require("../../../config/enum.js");
const constants = require("../../../config/constants.js");

class UserController extends RestController {

    constructor() {
        super("User")
        this.resource = 'User';
        this.request; //adonis request obj
        this.response; //adonis response obj
        this.params = {}; // this is used for get parameters from url
    }

    async validation(action, id = 0) {
        let validator = [];
        let rules;

        switch (action) {
            case "store":
                break;
            case "update":
                break;
        }
        return validator;
    }

    async beforeUpdateLoadModel() {
        this.params.id = this.request.user.slug;
        if (!this.request.files?.length) return

        try {
            const fileObject = this.request.files;
            const image_url = await FileHandler.doUpload(fileObject[0])
            this.request.image_url = image_url
            return
        }
        catch (err) {
            this.__is_error = true;
            console.log(err)
            return this.sendError(
                "Failed to upload user image",
                {},
                500
            )
        }
    }

    async afterStoreLoadModel(record) {
        this.__collection = false;
        return {}
    }

    async beforeDestroyLoadModel() {
        this.params.id = this.request.user.slug
    }

    async login({ request, response }) {
        try {
            this.request = request;
            this.response = response;
            let params = this.request.body;

            let rules = {
                "mobile_no": [
                    'required',
                    'unique:users,mobile_no',
                    "max:18"
                ],
                "device_type": "required|in:web,ios,android",
                // "device_token": "required"
            }
            let validator = await validateAsync(params, rules);
            let validation_error = this.validateRequestParams(validator);
            if (this.__is_error)
                return validation_error;

            let user = await this.modal.getUserByMobileNo(params.mobile_no);

            if (_.isEmpty(user)) {
                const payload = {}
                payload.mobile_no = params.mobile_no
                user = await this.modal.createRecord(this.request, payload);
            }

            if (!user.is_activated) {
                return this.sendError(
                    "You have been de-activated by Admin. Kindly contact the administrator",
                    {},
                    403
                );
            }

            if (user.is_blocked) {
                return this.sendError(
                    "You have been blocked by Admin. Kindly contact the administrator.",
                    {},
                    403
                );
            }

            const payload = {
                mobile_no: user.mobile_no
            }
            await UserOTP.instance().createRecord(this.request, payload);

            this.__is_paginate = false;
            await this.sendResponse(
                200,
                'Login otp has been sent to your number.',
                {}
            );
            return;
        }
        catch (err) {
            return this.sendError(
                'Internal server error. Please try again later.',
                {},
                500
            )
        }
    }


    async logout({ request, response }) {
        this.request = request;
        this.response = response;

        const user_slug = request.user.slug;
        const record = await UserApiToken.instance().deleteRecord(user_slug);

        this.__is_paginate = false;
        this.__collection = false;

        return this.sendResponse(
            200,
            "User Logout Successfully",
            {}
        )
    }

}


module.exports = UserController;