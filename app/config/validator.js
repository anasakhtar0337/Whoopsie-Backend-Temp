const Validator = require('validatorjs');
const dbContainer = require("../Database/index");
const _ = require('lodash');
const { getSplitCharacter } = require('../Helper');

Validator.registerAsync('unique', async function (value, attribute, req, passes) {
    console.log(value, attribute)
    const [table, col] = attribute.split(",");
    console.log(value)
    const model = dbContainer[table];

    const record = await model.count({ where: { [col]: value, deletedAt: null } });
    console.log("Unique counts : ", record)
    if (record > 0) {
        passes(false, `This ${col} is already registered.`);
    }
    else {
        passes();
    }

});

Validator.registerAsync('exists', async function (value, attribute, req, passes) {
    console.log(value, attribute)
    const [table, col] = attribute.split(",");
    console.log(value)
    const model = dbContainer[table];

    const record = await model.count({ where: { [col]: value, deletedAt: null } });
    if (record > 0) {
        passes(false, `Incorrect ${col} .`);
    }
    else {
        passes();
    }

});

Validator.register('notContainSpecialCharacter', (value) => {
    if (Array.isArray(value)) {
        return value.every(item => !item.includes(getSplitCharacter()))
    }
    else {
        return !value.includes(getSplitCharacter())
    }

},
    ':attribute should not contain special character.');


