
const RestModel = require("./RestModel");



class ResetPassword extends RestModel {

    constructor() {
        super("reset_passwords")
    }


    async createRecord(email, token) {

        await this.deleteAllToken(email);
        const record = await this.orm.create({
            email,
            token,
            createdAt: new Date()
        })

        return record.toJSON()

    }

    async deleteAllToken(email) {
        await this.orm.update(
            {
                deletedAt: new Date(),
            },
            {
                where: {
                    email: email,
                }
            });
        return true
    }

    async deleteResetPassToken(email, resetPassToken) {

        await this.orm.update(
            {
                deletedAt: new Date(),
            },
            {
                where: {
                    email: email,
                    token: resetPassToken,
                }
            });
        return true

    }

}


module.exports = ResetPassword