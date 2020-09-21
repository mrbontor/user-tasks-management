const fs = require('fs')
const Ajv = require('ajv');
const iniParser = require('../libs/iniParser')
const logging = require('../libs/logging')
const util = require('../libs/utils')
const db = require('./dbController')
const user_util = require('./user_utility');
var jwt = require('jsonwebtoken');

const userRegister    = JSON.parse(fs.readFileSync('./schema/user_register.json'))
const userLogin    = JSON.parse(fs.readFileSync('./schema/user_login.json'))

let config = iniParser.get()

//show All error if data not valid
const ajv = new Ajv({
    allErrors: false,
    loopRequired: Infinity
}); // options can be passed, e.g. {allErrors: true}


//user Registration
async function register(req, res) {
    let respons = {status: false, message: "Failed"}
    try {
        const {body} = req

        //validate user request
        let isRequestValid = await createRequesAuth(body, 'register')
        logging.debug(`[isRequestValid] >>>> TRUE =>FALSE || FALSE => TRUE ${JSON.stringify(isRequestValid)}`)
        //return error validation;
        if (isRequestValid.message){
            respons.errors = isRequestValid.message.message
            return res.status(400).send(respons);
        }
        //check password and current password
        if (body.password !== body.re_password) {
            res.message = "Password didn't match"
            return res.status(400).send(respons);
        }
        //check isExist username
        let checkUsername = await db.checkUsername(body.username)
        logging.info(`[checkUsername] >>>> ${JSON.stringify(checkUsername)}`)
        if(checkUsername) {
            respons.message = "Username already taken"
            return res.status(400).send(respons);
        }
        //check isExist email
        let checkEmail = await db.checkEmail(body.email)
        logging.info(`[checkEmail] >>>> ${JSON.stringify(checkEmail)}`)
        if (checkEmail) {
            respons.message = "Email already used"
            return res.status(400).send(respons);
        }

        let _request = formatRequestRegister(body)
        logging.debug(`[Payload] >>>> ${JSON.stringify(_request)}`)

        delete _request.password
        //store data user
        let storeUser = await db.createUser(_request)
        logging.debug(`[storeUser] >>>> ${JSON.stringify(storeUser)}`)
        if (!storeUser) {
            respons.message = "Something went wrong"
            return res.status(400).send(respons);
        }

        respons = {status: true, message: "Success", data: storeUser}
        res.status(200).send(respons)
    } catch (e) {
        logging.debug(`[register][err]   >>>>> ${e.stack}`)
        res.status(400).send(respons)
    }
}

//user login
async function login(req, res) {
    let respons = {status: false, message: "Failed"}
    try {
        const {body} = req

        //validate user request
        let isRequestValid = await createRequesAuth(body, 'login')
        logging.debug(`[isRequestValid] >>>> TRUE =>FALSE || FALSE => TRUE ${JSON.stringify(isRequestValid)}`)
        //return error validation;
        if (isRequestValid.message){
            respons.errors = isRequestValid.message.message
            return res.status(400).send(respons);
        }

        //checks user is exist
        let getUser = await db.getUser(body.username)
        logging.info(`[checkUsername] >>>> ${JSON.stringify(getUser)}`)

        if(!getUser || getUser === null) {
            respons.message = "User not found"
            return res.status(404).send(respons);
        }

        //validate password hashed
        let checkPassword = user_util.validatePassword(body.password, getUser.salt, getUser.hash)
        if (!checkPassword) {
            respons.message = "Invalid Password"
            return res.status(401).send(respons);
        }

        let preDate = {
            id: getUser.id,
            name: getUser.name,
            username: getUser.username,
            email: getUser.email,
            status: getUser.status
        }
        //generate token for authentication
        let token = jwt.sign(preDate, config.credential.secret, {
            expiresIn: config.credential.expired // expires in n hours
        });

        // storeToken
        let storeToken = await db.updateUser({token: token}, {id: getUser.id})
        if (!storeToken) {
            respons.message = "Something went wrong"
            return res.status(400).send(respons);
        }

        respons = {status: true, message: "Success", token: token}
        res.status(200).send(respons)
    } catch (e) {
        logging.debug(`[login][err]   >>>>> ${e.stack}`)
        res.status(400).send(respons)
    }
}

//user login
async function profile(req, res) {
    let authHeader = req.headers.authorization;
    let respons = {status: false, message: "Failed"}
    try {
        let token = authHeader.split(' ')[1];
        logging.info(`[token] >>>> ${JSON.stringify(token)}`);
        data = jwt.verify(token, config.credential.secret);
        logging.debug(`[data] >>>> ${JSON.stringify(data)}`)

        let user = await db.getUser(data.username)
        logging.info(`[checkUsername] >>>> ${JSON.stringify(user)}`)

        respons = {status: true, message: "Success", data: data}
        res.status(200).send(respons)
    } catch (e) {
        logging.debug(`[login][err]   >>>>> ${e.stack}`)
        res.status(400).send(respons)
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
    register,
    login,
    profile
};
