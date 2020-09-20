const iniParser = require('../libs/iniParser')
const logging = require('../libs/logging')
const db = require('../models/api-db')

const User = db.User

function check_username(username) {
    return new Promise(function (resolve, reject) {
        var result = false
        User.findOne({
            where: {
                username:username
            }
        })
        .then(function (data) {
            if (data !== null) result = true
            logging.info(`[check_username] >>>> ${JSON.stringify(data)}`)
            resolve(result)
        })
        .catch(function (err) {
            logging.error(`[check_username][ERR] >>>> ${JSON.stringify(err.stack)}`)
            if (err) reject(result)
        })
    })
}

function check_email(email) {
    return new Promise(function (resolve, reject) {
        var result = false
        User
        .findOne({
            where: {
                email:email
            }
        })
        .then(function (data) {
            if (data !== null) result = true
            logging.info(`[check_email] >>>> ${JSON.stringify(data)}`)
            resolve(result)
        })
        .catch(function (err) {
            logging.error(`[check_email][ERR] >>>> ${JSON.stringify(err.stack)}`)
            if (err) reject(result)
        })
    })
}

function get_user(username) {
    return new Promise(function (resolve, reject) {
        User.findOne({
            where: {
                username:username
            }
        })
        .then(function (data) {
            logging.info(`[get_user] >>>> ${JSON.stringify(data)}`)
            if (data !== null) resolve(data)
        })
        .catch(function (err) {
            logging.error(`[get_user][ERR] >>>> ${JSON.stringify(err.stack)}`)
            if (err) reject(false)
        })
    })
}

function create_user(data) {
    return new Promise(function (resolve, reject) {
        User.create(data)
        .then(result => {
            resolve(result.toJSON());
            logging.debug(`[DEBUG][MYSQL][OUT][CREATE][USER] ${JSON.stringify(result)} `);
        })
        .catch(err => {
            logging.error(`[ERROR][MYSQL][OUT][CREATE][USER] ${JSON.stringify(err)} `);
            if(err) reject(false)
        });
    });
}


module.exports = {
    checkUsername: check_username,
    checkEmail: check_email,
    getUser: get_user,
    createUser: create_user
};
