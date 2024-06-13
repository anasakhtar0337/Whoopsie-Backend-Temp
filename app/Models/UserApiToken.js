const jwt = require("jsonwebtoken")
const _ = require("lodash")
const constants = require("../config/constants")
const { API_TOKENS_ENUM } = require("../config/enum")

const RestModel = require("./RestModel")

class UserApiToken extends RestModel {

    constructor() {
        super("user_api_tokens")
    }

    softdelete() {
        return true;
    }

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */

    getFields() {
        return [
            'slug', 'device_type', 'device_token', 'type'
        ];
    }



    showColumns() {
        return [
            'slug', 'api_token', 'type', 'createdAt'
        ];
    }

    async beforeCreateHook(request, params) {
        const type = params?.type ? params.type : API_TOKENS_ENUM.ACCESS
        const remove_type = params?.remove_type ? params.remove_type : params.type
        await this.deleteRecord(params.slug, remove_type);
        params.api_token = this.generateApiToken(params.slug)
        params.device_type = request.body.device_type
        params.device_token = request.body.device_token
        params.type = type;
        params.created_at = new Date()

    }

    async afterCreateHook(record, request, params) {
        request.api_token = record.api_token;
        delete request.headers['authorization'];

    }

    generateApiToken(slug) {
        let jwt_options = {
            algorithm: 'HS256',
            expiresIn: constants.JWT_EXPIRY,
            issuer: constants.CLIENT_ID,
            subject: constants.CLIENT_ID,
            jwtid: slug
        }
        var token = jwt.sign({ slug: slug }, constants.JWT_SECRET, jwt_options);
        return token;
    }

    async getRecordByUserSlug(user_slug) {
        const record = await this.orm.findOne({
            where: {
                deletedAt: null,
            },
            include: {
                model: User.instance().getModel(),
                required: true,
                where: {
                    slug: user_slug,
                    is_activated: true,
                    deletedAt: null,
                }
            },
            order: [['createdAt', 'desc']]
        })

        return _.isEmpty(record) ? {} : record.toJSON();
    }

    async deleteRecord(slug, type = 'ALL') {
        console.log("Delete Api Token : ", slug)

        const conditions = {};
        conditions.slug = slug;
        if (type !== 'ALL') {
            conditions.type = type
        }

        const query = await this.orm.update({
            deletedAt: new Date()
        }, {
            where: conditions
        })
        return true;

    }




}

module.exports = UserApiToken;

const User = require("./User");
const { param } = require("../routes/User")

