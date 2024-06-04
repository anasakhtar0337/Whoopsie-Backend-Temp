"use strict";

const _ = require("lodash");
const moment = require("moment");
const { baseUrl } = require("../Helper/index");
const db = require("../Database/index");
const constants = require("../config/constants");

class RestModel {

    constructor(orm) {
        this.orm = this.loadOrm(orm);
    }

    /**
     *
     * @param request
     * @param params
     * @returns {Promise<*>}
     */

    getModel() {
        return this.orm
    }

    static instance() {
        return new this();
    }

    async createRecord(request, params) {
        //before create hook
        console.log("Before creating record hook : ", params)
        if (_.isFunction(this.beforeCreateHook)) {
            await this.beforeCreateHook(request, params);
        }
        //insert record
        var record = await this.orm.create(params);
        console.log("Orm created Record : ", record.toJSON());
        //after create hook
        if (_.isFunction(this.afterCreateHook)) {
            await this.afterCreateHook(record, request, params);
        }
        //get record by id
        // var record = await this.getRecordBySlug(request, record.slug);

        return record.toJSON();
    }

    async getRecords(request, params = {}) {
        const page = _.isEmpty(request.query.page) ? 0 : parseInt(request.query.page) - 1;
        const limit = _.isEmpty(request.query.limit) ? constants.PAGINATION_LIMIT : parseInt(request.query.limit);

        let query = {
            where: {
                deletedAt: null,
            },
            attributes: this.showColumns(),
        }

        //query hook
        if (_.isFunction(this.indexQueryHook)) {
            await this.indexQueryHook(query, request, params);
        }

        //Count Total Record And Store in Request Object
        const totalQuery = {
            where: query.where,
            include: query?.include ?? [],
            distinct: true,
        }
        const totalRecord = await this.orm.count(totalQuery);
        request.query.total = totalRecord;

        query = {
            ...query,
            raw: false,
            limit: limit,
            offset: page * limit
        }

        console.log("Get All Records Query : ", query, totalRecord)
        const record = (await this.orm.findAll(query)).map(item => item.get({ plain: true }));

        return _.isEmpty(record) ? [] : record;

    }

    async getRecordByCondition(request, conditions) {
        let query = {
            where: conditions,
            attributes: this.showColumns(),
        }

        //query hook
        if (_.isFunction(this.conditionalQueryHook)) {
            await this.conditionalQueryHook(query, request);
        }

        console.log("Get Single Records Query : ", query)
        const record = await this.orm.findOne(query);
        return _.isEmpty(record) ? {} : record.toJSON();

    }

    async getRecordsByCondition(request, conditions) {
        let query = {
            where: conditions,
            attributes: this.showColumns(),
        }

        //query hook
        if (_.isFunction(this.conditionalQueryHook)) {
            await this.conditionalQueryHook(query, request);
        }
        query.raw = false;

        console.log("Get All Records Query : ", query)
        const record = (await this.orm.findAll(query)).map(item => item.get({ plain: true }));
        return _.isEmpty(record) ? [] : record;

    }

    /**
       *
       * @param request
       * @param slug
       * @returns {Promise<*>}
       */
    async getRecordBySlug(request, slug) {
        let query = {
            where: {
                deletedAt: null,
            },
            attributes: this.showColumns(),
        }
        //query hook
        if (_.isFunction(this.singleQueryHook)) {
            await this.singleQueryHook(query, request, slug);
        }

        //Add Slug Condition
        query = {
            ...query,
            where: {
                ...query.where,
                slug: slug
            }
        }

        //get record;
        console.log("Generated Query : ", query)
        let record = await this.orm.findOne(query)


        console.log('Get Record By Slug Result : ', record?.toJSON())
        if (!_.isEmpty(record)) {
            return record.toJSON();
        } else {
            return {};
        }
    }

    /**
       *
       * @param request
       * @param params
       * @param id
       * @returns {Promise<*>}
       */
    async updateRecord(request, params, slug) {
        let record;
        //before update hook
        if (_.isFunction(this.beforeEditHook)) {
            await this.beforeEditHook(request, params, slug);
        }
        //update record
        if (!_.isEmpty(params)) {
            console.log(params)
            record = await this.orm.update(params, {
                where: {
                    slug: slug
                }
            })
        }
        record = await this.getRecordBySlug(request, slug);

        //After  update hook
        if (_.isFunction(this.afterEditHook)) {
            await this.afterEditHook(record, request, params);
        }

        return record;
    }

    /**
     *
     * @param request
     * @param params
     * @param id
     * @returns {Promise<void>}
     */
    async deleteRecord(request, params, slug) {
        //before delete hook
        let slug_arr = [];
        if (_.isFunction(this.beforeDeleteHook)) {
            await this.beforeDeleteHook(request, params, slug);
        }
        if (slug == 'delete-record') {
            slug_arr = params.slug
        }
        else if (Array.isArray(slug)) {
            slug_arr = slug
        }
        else {
            slug_arr.push(slug);
        }
        //check soft delete
        if (_.isFunction(this.softdelete)) {
            if (this.softdelete()) {
                await this.orm.update({
                    deletedAt: new Date()
                }, {
                    where: {
                        slug: slug_arr
                    }
                })
            } else {
                await this.orm.destroy({
                    where: {
                        slug: slug_arr
                    }
                })
            }
        } else {
            await this.orm.destroy({
                where: {
                    slug: slug_arr
                }
            })
        }
        //after delete hook
        if (_.isFunction(this.afterDeleteHook)) {
            await this.afterDeleteHook(request, params, slug);
        }
        return true;
    }

    async forceDeleteRecord(slug) {
        //check soft delete
        if (_.isFunction(this.softdelete)) {
            if (this.softdelete()) {
                await this.orm.update({
                    deletedAt: new Date()
                }, {
                    where: {
                        slug: slug
                    }
                })
            } else {
                await this.orm.destroy({
                    where: {
                        slug: slug
                    }
                })
            }
        } else {
            await this.orm.destroy({
                where: {
                    slug: slug_arr
                }
            })
        }
        return true;
    }

    async dataTableRecords(request) {
        let data = [];
        let params = request.all();
        let query = this.query()
            .select(this.showColumns())
            .whereNull("deleted_at");

        if (_.isFunction(this.datatable_query_hook))
            await this.datatable_query_hook(query, request);

        data['total_record'] = await query.getCount();
        query = query.limit(parseInt(params['length'])).offset(parseInt(params['start'])).orderBy('id', 'desc');
        query = await query.fetch();
        data['records'] = !_.isEmpty(query) ? query.toJSON() : [];
        return data;
    }

    async setImage(record) {
        let image_url, blur_image;
        if (record.image_url != null && record.image_url != '') {
            if (record.image_url.startsWith('http')) {
                image_url = record.image_url
            } else {
                image_url = baseUrl() + record.image_url;
            }
            blur_image = record.blur_image;
        } else {
            image_url = baseUrl() + '/images/user-placeholder.jpg'
            blur_image = 'L5Mj]zRj00%M00WB4nt7_3t7~qRj';
        }
        return { image_url, blur_image };
    }


    loadOrm(name) {
        return db[name];
    }

}
module.exports = RestModel;
