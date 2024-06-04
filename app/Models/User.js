const { v4: uuidv4 } = require('uuid');
const _ = require("lodash")
const randomstring = require("randomstring");

const RestModel = require("./RestModel")
const UserApiToken = require('./UserApiToken');
const UserOTP = require('./UserOTP');
const { LOGIN_TYPE, API_TOKENS_ENUM, ROLES } = require('../config/enum');
const constants = require('../config/constants');

class User extends RestModel {

    constructor() {
        super("users")
    }

    softdelete() {
        return false;
    }

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */

    getFields() {
        return [
            'name', 'username', 'mobile_no',
        ];
    }


    showColumns() {
        return [
            'id', 'user_type', 'name', 'username', 'slug', 'mobile_no',
            'image_url', 'is_mobile_verify', 'mobile_verifyAt',
            'status', 'is_activated', 'login_type',
            'is_blocked', 'createdAt'
        ];
    }

    /**
     * omit fields from update request
     */
    exceptUpdateField() {
        return [
            'id', 'user_type', 'slug', 'email',
            'mobile_no', 'is_mobile_verify', 'mobile_verifyAt',
            'login_type', , 'is_activated', 'is_blocked',
            'createdAt', 'deletedAt'
        ];
    }

    /**
     * Hook for manipulate query of index result
     * @param {current mongo query} query
     * @param {adonis request object} request
     * @param {object} slug
     */
    async indexQueryHook(query, request, slug = {}) {

    }

    /**
     * Hook for manipulate data input before add data is execute
     * @param {adonis request object} request
     * @param {payload object} params
     */
    async beforeCreateHook(request, params) {
        params.user_type = ROLES.USER;
        params.slug = uuidv4();
        params.username = null;
        params.name = null;
        params.password = randomstring.generate(8)
        params.login_type = LOGIN_TYPE.CUSTOM
        params.createdAt = new Date();

    }

    /**
     * Hook for execute command after add public static function called
     * @param {saved record object} record
     * @param {controller request object} request
     * @param {payload object} params
     */
    async afterCreateHook(record, request, params) {
        // const userApiToken = UserApiToken.instance();
        // await userApiToken.createRecord(request, extractFields(record, userApiToken.getFields()))

        // const otp_record = {};

        // if ((constants.SMS_VERIFICATION == 1) && record.mobile_no) {
        //     otp_record.mobile_no = record.mobile_no;
        // }
        // if (!_.isEmpty(otp_record)) {
        //     await UserOTP.instance().createRecord(request, otp_record)
        // }
        // return;

    }

    /**
     * Hook for manipulate data input before update data is execute
     * @param {adonis request object} request
     * @param {payload object} params
     * @param {string} slug
     */
    async beforeEditHook(request, params, slug) {
        let exceptUpdateField = this.exceptUpdateField();
        exceptUpdateField.filter(exceptField => {
            delete params[exceptField];
        });

        if (request?.image_url) {
            params.image_url = request.image_url;
        }
    }

    async getUserByMobileNo(mobile_no) {
        let query = await this.orm.findOne({
            where: {
                user_type: ROLES.USER,
                mobile_no: mobile_no,
                deletedAt: null
            }
        })
        return !_.isEmpty(query) ? query.toJSON() : {};
    }


    async getUserByApiToken(api_token, type = API_TOKENS_ENUM.ACCESS) {
        let query = await this.orm.findOne({
            where: {
                user_type: ROLES.USER,
            },
            include: [
                {
                    model: UserApiToken.instance().getModel(),
                    where: {
                        api_token: api_token,
                        type: type,
                        deletedAt: null
                    },
                    order: [['createdAt', 'DESC']]
                },
            ]
        })

        return _.isEmpty(query) ? {} : _.isEmpty(query.toJSON()?.user_api_tokens) ? {} : query.toJSON();
    }

    async verifySocial(request, slug) {
        await this.orm.update(
            {
                mobile_verifyAt: new Date(),
                is_mobile_verify: true
            },
            {
                where: {
                    slug: slug,
                    deletedAt: null
                }
            })
        return true;
    }

    async updateUser(condition, data) {
        await this.orm.update(data, {
            where: condition
        });
        return true;
    }
}

module.exports = User;