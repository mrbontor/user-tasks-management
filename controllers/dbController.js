const iniParser = require('../libs/iniParser')
const logging = require('../libs/logging')
const db = require('../models/api-db')
const Sequelize = require('sequelize');

const User = db.User
const Task = db.Task
const Op = Sequelize.Op;
/**
 * [user model query]
 * @return {[type]}        [description]
 */

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
            if (data.length >= 1) result = true
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
            if (data.length >= 1) result = true
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

/**
* [task model query]
* @return {[type]}        [description]
*/

function create_task(data) {
    return new Promise(function (resolve, reject) {
        Task.create(data)
        .then(result => {
            resolve(result.toJSON());
            logging.debug(`[create_task] ${JSON.stringify(result)} `);
        })
        .catch(err => {
            logging.error(`[create_task][err] ${JSON.stringify(err)} `);
            if(err) reject(false)
        });
    });
}

function update_task(data, clause) {
    return new Promise(function (resolve, reject) {
        let result = false
        Task.update(data, {where: clause})
        .then(rest => {
            if (rest == 1) result = true
            resolve(result);
            logging.debug(`update_task] ${JSON.stringify(result)} `);
        })
        .catch(err => {
            logging.error(`[update_task][err] ${JSON.stringify(err)} `);
            if(err) reject(false)
        });
    });
}

function get_task_by_(user_id, opt = []) {
    if (opt.length == 0) {
        opt = [0,1]
    }
    return new Promise(async function (resolve, reject) {
        Task.findAll({
            where: {
                status: { [Op.in]: [0, 1, 2]},
                forever: { [Op.in]: opt},
                user_id: user_id,
                [Op.and] : [
                    Sequelize.where(
                        Sequelize.fn('DATE', Sequelize.col('start_at')), Sequelize.literal('CURRENT_DATE')
                        // Sequelize.fn('DATE', Sequelize.col('start_at')), {
                            //     [Op.gt] : date
                            // }
                    )
                ]
            },
            include: [
                {
                    attributes: ['username','name'],
                    model: User
                }
            ],
            order: [['id', 'DESC']],
            raw: true,
            nest: true,
        })
        .then(function (data) {
            if (data.length != 0) resolve(data)
        })
        .catch(function (err) {
            logging.error(`[get_task_by_][err] >>>> ${JSON.stringify(err.stack)}`)
            if (err) reject(false)
        })
    })
}

function check_task_exist(user_id, date) {
    return new Promise(function (resolve, reject) {
        Task.findAll({
            where: {
                status: { [Op.in]: [0, 1, 2]},
                user_id: user_id,
                [Op.and] : [
                    { end_at: { [ Op.gte ]: date.start_at } },
                    { end_at: { [ Op.lte ]: date.end_at } }
                ]
            },
            include: [
                {
                    attributes: ['username','name'],
                    model: User
                }
            ],
            order: [['id', 'DESC']],
            raw: true,
            nest: true,
        })
        .then(function (data) {
            resolve(data)
        })
        .catch(function (err) {
            logging.error(`[check_task_exist][err] >>>> ${JSON.stringify(err.stack)}`)
            if (err) reject(false)
        })
    })
}

module.exports = {
    checkUsername: check_username,
    checkEmail: check_email,
    getUser: get_user,
    createUser: create_user,
    updateUser: update_user,
    createTask: create_task,
    updateTask: update_task,
    getTaskToday: get_task_by_,
    checkExistTask: check_task_exist
};
