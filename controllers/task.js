const fs = require('fs')
const Ajv = require('ajv');
const iniParser = require('../libs/iniParser')
const logging = require('../libs/logging')
const util = require('../libs/utils')
const db = require('./dbController')
const user_util = require('./user_utility');


const createTask    = JSON.parse(fs.readFileSync('./schema/create_task.json'))
const updateTask    = JSON.parse(fs.readFileSync('./schema/update_task.json'))

let config = iniParser.get()

//show All error if data not valid
const ajv = new Ajv({
    allErrors: false,
    loopRequired: Infinity
}); // options can be passed, e.g. {allErrors: true}

async function create_task(req, res) {
    let respons = {status: false, message: "Failed"}
    try {
        let user = user_util.getUserInfo(req)
        let nowDate = util.formatDateStandard(new Date())
        let nowDateTime = util.formatDateStandard(new Date(), true)

        const {body} = req

        //validate user request
        let isRequestValid = await validateRequest(body, 'create')
        logging.debug(`[isRequestValid] >>>> TRUE =>FALSE || FALSE => TRUE ${JSON.stringify(isRequestValid)}`)
        //return error validation;
        if (isRequestValid.message){
            respons.errors = isRequestValid.message.message
            return res.status(400).send(respons);
        }


        // check if is exist
        let isExistTask = await db.checkExistTask(user.id, body)
        logging.debug(`[isExistTask] >>>> ${JSON.stringify(isExistTask)}`)
        if (isExistTask.length !== 0) {
            respons.message = "your time will be potentially clashed"
            return res.status(200).send(respons);
        }

        let _data = {
            name: body.name,
            description: body.description,
            user_id: user.id,
            start_at: body.start_at,
            end_at: body.end_at,
            start_time: util.formatTime(body.start_at),
            end_time: util.formatTime(body.end_at),
            forever: body.is_forever,
            created_at: util.formatDateStandard(new Date(), true),
            updated_at: util.formatDateStandard(new Date(), true)
        }
        if (body.is_forever === 1) {
            delete _data.start_at
            delete _data.end_at
            _data.date_forever = {
                at_time: body.data_forever.at_time,
                at_date: body.data_forever.at_date,
                description: body.data_forever.description,
            }
        }
        logging.debug(`[_data] >>>> ${JSON.stringify(_data)}`)

        let storeTask = await db.createTask(_data)
        logging.debug(`[storeTask] >>>> ${JSON.stringify(storeTask)}`)

        respons = {status: true, message: "Success", data: isExistTask}
        // respons = {status: true, message: "Success", data: storeTask}
        res.status(200).send(respons)
    } catch (e) {
        logging.debug(`[create_task][err]   >>>>> ${e.stack}`)
        res.status(400).send(respons)
    }
}

function update_task() {

}

function delete_task() {

}

//get task today
async function getTaskToday(req, res) {
    let respons = {status: false, message: "No data Found", data: []}
    try {
        let user = user_util.getUserInfo(req)
        logging.debug(`[getTaskToday] >>>> ${JSON.stringify(user)}`)
        let getTaskToday = await db.getTaskToday(user.id)
        if (getTaskToday.length == 0) {
            return res.status(404).send(respons)
        }
        let newData = remapingData(getTaskToday)
        logging.debug(`[getTaskToday] >>>> ${JSON.stringify(newData)}`)

        respons = {status: true, message: "Success", data: newData}
        res.status(200).send(respons)
    } catch (e) {
        logging.debug(`[register][err]   >>>>> ${e.stack}`)
        res.status(400).send(respons)
    }
}

//get task forever
async function getTaskFilterForeverinToday(req, res) {
    let respons = {status: false, message: "No data Found", data: []}
    try {
        let user = user_util.getUserInfo(req)
        console.log(req.params);
        let is_forever = [0,1]
        if (req.params.is && req.params.is === 'yes') {
            is_forever = [1]
        }else if (req.params.is && req.params.is === 'no') {
            is_forever = [1]
        }
        let getTaskToday = await db.getTaskToday(user.id, is_forever)
        if (getTaskToday.length == 0) {
            return res.status(404).send(respons)
        }
        let newData = await remapingData(getTaskToday)
        logging.debug(`[getTaskToday] >>>> ${JSON.stringify(newData)}`)

        respons = {status: true, message: "Success", data: newData}
        res.status(200).send(respons)
    } catch (e) {
        logging.debug(`[register][err]   >>>>> ${e.stack}`)
        res.status(400).send(respons)
    }
}

//check user request form body
async function validateRequest(request, type) {
    let result = {}
    let valid
    switch (type) {
        case 'create':
            valid = ajv.validate(createTask, request);
            break;
        default:
            valid = ajv.validate(updateTask, request)
    }
    logging.debug(`[validateRequest] >>>> ${JSON.stringify(ajv.errors)}`)

    if (!valid) {
        result = util.handleErrorValidation(ajv.errors);
    }
    return Promise.resolve(result);
}

//reformat type data text into jSON
function remapingData(array) {
    const result = array.map(el => {
        // console.log(el);
        if (typeof el.date_forever === "string") {
            el.date_forever = JSON.parse(el.date_forever)
            el.start_at = util.formatDateStandard(el.start_at, true)
            el.end_at = util.formatDateStandard(el.end_at, true)
            el.created_at = util.formatDateStandard(el.created_at, true)
            el.updated_at = util.formatDateStandard(el.updated_at, true)
        }
        return el;
    });
    return result;
    // return Promise.resolve(result);
}



module.exports = {
    create: create_task,
    update: update_task,
    getToday: getTaskToday,
    getForeverToday: getTaskFilterForeverinToday
};
