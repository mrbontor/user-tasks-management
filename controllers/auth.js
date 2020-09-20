const fs = require('fs')
const Ajv = require('ajv');
const iniParser = require('../libs/iniParser')
const logging = require('../libs/logging')
const util = require('../libs/utils')
const db = require('./dbController')
const user_util = require('./user_utility');

const userRegister    = JSON.parse(fs.readFileSync('./schema/user_register.json'))
const userLogin    = JSON.parse(fs.readFileSync('./schema/user_login.json'))

let config = iniParser.get()

//show All error if data not valid
const ajv = new Ajv({
    allErrors: false,
    loopRequired: Infinity
}); // options can be passed, e.g. {allErrors: true}

const SUCCESS             = 200
const FAILED              = 400

//user Registration
async function register(req, res) {
    let respons = {status: false, message: "Failed"}
    try {
        let isRequestValid = await createRequesAuth(req.body, 'register')
        logging.debug(`[isRequestValid] >>>> TRUE =>FALSE || FALSE => TRUE ${JSON.stringify(isRequestValid)}`)

        if (isRequestValid.message){
            respons.errors = isRequestValid.message.message
            return res.status(200).send(respons);
        }

        let isExist = await user_util.checkRegister(req.body)
        logging.debug(`[isExist] >>>> ${JSON.stringify(isExist)}`)
        if (!isExist.status) {
            respons.message = isExist.message
            return res.status(200).send(respons);
        }

        let _request = formatRequest(req.body)
        logging.debug(`[Payload] >>>> ${JSON.stringify(_request)}`)

        delete _request.password
        let storeUser = await db.createUser(_request)
        logging.debug(`[storeTrx] >>>> ${JSON.stringify(storeUser)}`)

        respons = {status: true, message: "Success", data: storeUser, e: _request}
        res.status(200).send(respons)
    } catch (e) {
        logging.debug(`[register][ERR]   >>>>> ${e.stack}`)
        res.status(400).send(respons)
    }
}

//user login
async function register(req, res) {
    let respons = {status: false, message: "Failed"}
    try {
        let isRequestValid = await createRequesAuth(req.body)
        logging.debug(`[isRequestValid] >>>> TRUE =>FALSE || FALSE => TRUE ${JSON.stringify(isRequestValid)}`)

        if (isRequestValid.message){
            respons.errors = isRequestValid.message.message
            return res.status(200).send(respons);
        }

        let isExist = await user_util.checkRegister(req.body)
        logging.debug(`[isExist] >>>> ${JSON.stringify(isExist)}`)
        if (!isExist.status) {
            respons.message = isExist.message
            return res.status(200).send(respons);
        }

        let _request = formatRequest(req.body)
        logging.debug(`[Payload] >>>> ${JSON.stringify(_request)}`)

        delete _request.password
        let storeUser = await db.createUser(_request)
        logging.debug(`[storeTrx] >>>> ${JSON.stringify(storeUser)}`)

        respons = {status: true, message: "Success", data: storeUser, e: _request}
        res.status(200).send(respons)
    } catch (e) {
        logging.debug(`[register][ERR]   >>>>> ${e.stack}`)
        res.status(400).send(respons)
    }
}

function validate_(data) {
    let result = false
    if (data.password !== data.re_password) {
        return result;
    }
}

function formatRequestRegister(request) {
    let result = {
        name: request.fullname,
        username: request.username,
        email: request.email,
        password: request.password,
        re_password: request.re_password,
        type: request.type,
        created_at: util.formatDateStandard(new Date(), true),
        updated_at: util.formatDateStandard(new Date(), true)
    }
    let pwd = user_util.makePassword(result.password)

    result.salt = pwd.salt
    result.hash = pwd.hash

    return result;
}

async function createRequesAuth(request, type) {
    let result = {}
    let valid
    switch (type) {
        case 'login':
            valid = ajv.validate(userLogin, request);
            break;
        default:
            valid = ajv.validate(userRegister, request)
    }
    logging.debug(`[createRequesAuth] >>>> ${JSON.stringify(ajv.errors)}`)

    if (!valid) {
        result = util.handleErrorValidation(ajv.errors);
    }
    return Promise.resolve(result);
}


module.exports = {
    register
};
