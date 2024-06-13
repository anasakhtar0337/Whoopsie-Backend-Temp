const _ = require("lodash")

const { validateAll, extractFields } = require("../../../Helper/index.js");

const RestController = require("../../RestController.js");
const User = require("../../../Models/User.js");
const UserApiToken = require("../../../Models/UserApiToken.js");
const { API_TOKENS_ENUM, OTP_VERIFICATION_TYPE } = require("../../../config/enum.js");


class UserOTPController extends RestController {

    constructor() {
        super("UserOTP")
        this.resource = 'UserOTP';
        this.request; //request obj
        this.response; //response obj
        this.params = {}; // this is used for get parameters from url
    }

    async validation(action, id = 0) {
        let validator = [];
        let rules;

        switch (action) {
            case "store":
                rules = {
                    mobile_no: 'required'
                }
                validator = await validateAll(this.request.body, rules)

                break;
            case "update":
                break;
        }
        return validator;
    }

    async beforeStoreLoadModel() {
        const params = this.request.body

        const user = await User.instance().getUserByMobileNo(params.mobile_no);
        if (_.isEmpty(user)) {
            this.__is_error = true;
            return this.sendError(
                'This mobile no. is not associated with any user.',
                {},
                400
            );
        }
    }

    async afterStoreLoadModel() {
        this.__collection = false;
        return {}
    }


    async verifyOTPRegister({ request, response }) {
        this.request = request;
        this.response = response;

        let params = this.request.body

        /**
         * use email : email and 
         * mobile_no : required_without:email 
         * only when reqgister screen contain optional email or password and not mandatry both
         * 
         */
        const rules = {
            mobile_no: 'required',
            otp: "required",
            device_type: "required|in:web,android,ios",
            // device_token: "required",
        }

        const validator = await validateAll(params, rules)
        const validation_error = await this.validateRequestParams(validator)

        if (this.__is_error)
            return validation_error;

        let user;
        let record;

        if (params.mobile_no) {
            record = await this.modal.verifyOTP(request, params, OTP_VERIFICATION_TYPE.MOBILE_NO)
        }

        if (_.isEmpty(record)) {
            return this.sendError(
                'Incorrect OTP',
                {},
                400
            )
        }

        user = await User.instance().getUserByMobileNo(params.mobile_no);
        await User.instance().verifySocial(this.request, user.slug)

        params.slug = user.slug;
        await UserApiToken.instance().createRecord(
            request,
            extractFields(
                params,
                UserApiToken.instance().getFields()
            )
        )
        await this.modal.deleteRecord(user?.email, user?.mobile_no)

        this.resource = 'User'
        this.__is_paginate = false;
        return this.sendResponse(
            200,
            'OTP verified',
            user
        )
    }


    async verifyOTPChangeNumber({ request, response }) {
        this.request = request;
        this.response = response;
        let params = this.request.body
        let user = this.request.user;
        let record;

        const rules = {
            otp: "required"
        }

        const validator = await validateAll(params, rules)
        const validation_error = await this.validateRequestParams(validator)

        if (this.__is_error)
            return validation_error;


        params.mobile_no = user.mobile_no || ''
        if (params.mobile_no) {
            record = await this.modal.verifyOTP(request, params, OTP_VERIFICATION_TYPE.MOBILE_NO)
        }

        if (_.isEmpty(record)) {
            return this.sendError(
                'Incorrect OTP',
                {},
                400
            )
        }

        const payload = {}
        payload.slug = user.slug;
        payload.type = API_TOKENS_ENUM.UPDATE_NUMBER

        await UserApiToken.instance().createRecord(
            request,
            payload,
        )
        await this.modal.deleteRecord(user.email, user.mobile_no)

        this.resource = 'UpdateNumberOTP'
        this.__is_paginate = false;
        return this.sendResponse(
            200,
            'OTP verified',
            {}
        )
    }

    async verifyOTPNewNumber({ request, response }) {
        this.request = request;
        this.response = response;
        let user = this.request.user;

        let params = this.request.body

        const rules = {
            mobile_no: 'required',
            otp: "required"
        }

        const validator = await validateAll(params, rules)
        const validation_error = await this.validateRequestParams(validator)

        if (this.__is_error)
            return validation_error;

        let record;

        if (params.mobile_no) {
            record = await this.modal.verifyOTP(request, params, OTP_VERIFICATION_TYPE.MOBILE_NO)
        }

        if (_.isEmpty(record)) {
            return this.sendError(
                'Incorrect OTP',
                {},
                400
            )
        }

        //update new password
        user.mobile_no = params.mobile_no;
        let update_params = {
            mobile_no: params.mobile_no
        }
        //update user
        await User.instance().updateUser({ slug: user.slug }, update_params);


        const payload = {}
        payload.slug = user.slug;
        payload.type = API_TOKENS_ENUM.ACCESS
        payload.remove_type = 'ALL'

        await UserApiToken.instance().createRecord(
            request,
            payload,
        )
        await this.modal.deleteRecord(user.email, user.mobile_no)

        this.resource = 'User'
        this.__is_paginate = false;
        return this.sendResponse(
            200,
            'Number changed successfully.',
            user
        )
    }

}


module.exports = UserOTPController;