const iniParser = require('../libs/iniParser')
const logging = require('../libs/logging')
const db = require('../models/api-db')

const User = db.User

function check_username(username) {
    return new Promise(function (resolve, reject) {
        var result = false
        User.findAll({
            where: {
                username:username
            },
             attributes: ['id', 'username']
        })
        .then(function (data) {
            if (data !== null) result = true
            logging.info(`[check_username] >>>> ${JSON.stringify(data)}`)
            resolve(result)
        })
        .catch(function (err) {
            logging.error(`[check_username][err] >>>> ${JSON.stringify(err.stack)}`)
            if (err) reject(result)
        })
    })
}

function check_email(email) {
    return new Promise(function (resolve, reject) {
        var result = false
        User
        .findAll({
            where: {
                email:email
            },
            attributes: ['id', 'username'],
        })
        .then(function (data) {
            if (data !== null) result = true
            logging.info(`[check_email] >>>> ${JSON.stringify(data)}`)
            resolve(result)
        })
        .catch(function (err) {
            logging.error(`[check_email][err] >>>> ${JSON.stringify(err.stack)}`)
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
            if (data !== null) resolve(data)
        })
        .catch(function (err) {
            logging.error(`[get_user][err] >>>> ${JSON.stringify(err.stack)}`)
            if (err) reject(false)
        })
    })
}

function create_user(data) {
    return new Promise(function (resolve, reject) {
        User.create(data)
        .then(result => {
            resolve(result.toJSON());
            logging.debug(`[create_user] ${JSON.stringify(result)} `);
        })
        .catch(err => {
            logging.error(`[create_user][err] ${JSON.stringify(err)} `);
            if(err) reject(false)
        });
    });
}

function update_user(data, clause) {
    return new Promise(function (resolve, reject) {
        let result = false
        User.update(data, {where: clause})
        .then(rest => {
            if (rest == 1) result = true
            resolve(result);
            logging.debug(`update_user] ${JSON.stringify(result)} `);
        })
        .catch(err => {
            logging.error(`[update_user][err] ${JSON.stringify(err)} `);
            if(err) reject(false)
        });
    });
}


module.exports = {
    checkUsername: check_username,
    checkEmail: check_email,
    getUser: get_user,
    createUser: create_user,
    updateUser: update_user
};
