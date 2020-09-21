'use strict';

var crypto = require('crypto');
const db = require('./dbController')
const logging = require('../libs/logging')
const iniParser = require('../libs/iniParser')

let config = iniParser.get()
/**
 * generates random string of characters i.e salt
 * @function
 * @param {number} length - Length of the random string.
 */
var genRandomString = function(length){
    return crypto.randomBytes(Math.ceil(length/2))
            .toString('hex') /** convert to hexadecimal format */
            .slice(0,length);   /** return required number of characters */
};

/**
 * hash password with sha512.
 * @function
 * @param {string} password - List of required fields.
 * @param {string} salt - Data to be validated.
 */

function makePassword(password) {
    let salt = genRandomString(16); /** Gives us salt of length 16 */

    // Hashing user's salt and password with 1000 iterations, 64 length and sha512 digest
    let hash = crypto.pbkdf2Sync(password, salt, 1000, 64, config.credential.method).toString(`hex`)
    return {
        salt: salt,
        hash: hash
    }
}

function validatePassword(password, salt, hashed) {
    let hash = crypto.pbkdf2Sync(password, salt, 1000, 64, config.credential.method).toString(`hex`);
    return hash === hashed;
};

// let c = {
//   salt: '2482a60d61fd2ad8',
//   hash: '34ab7acb98594e7c8c8136a39bf03c6bded62ee2e852d9e95fde1105c004302f7b0430491b0625c47aac3d60ce02c4300399749ba736c8512d377ea6c4d8453d'
// }
//
// // let pwd1 = makePassword('mypasword')
// let pwd2 = validatePassword('mypasword', c.salt, c.hash)
// // console.log(pwd1);
// console.log(pwd2);


async function checkRegister(data) {
    try {
        let res = {status: false}

        if (data.password !== data.re_password) {
            res.message = "Password didn't match"
            return res
        }

        let checkUsername = await db.checkUsername(data.username)
        logging.info(`[checkUsername] >>>> ${JSON.stringify(checkUsername)}`)

        if(checkUsername) {
            res.message = "Username already taken"
            return res
        }

        let checkEmail = await db.checkEmail(data.email)
        logging.info(`[checkEmail] >>>> ${JSON.stringify(checkEmail)}`)

        if (checkEmail) {
            res.message = "Email already used"
            return res
        }
        res.status = true
        return res;
    } catch (e) {
        logging.info(`[checkRegister] >>>> ${JSON.stringify(e)}`)
    }
}


module.exports = {
    makePassword,
    validatePassword,
    checkRegister
};
