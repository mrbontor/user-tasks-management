const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
const iniParser = require('../libs/iniParser')
const logging = require('../libs/logging')
const util = require('../libs/utils')
const db = require('./dbController')
/**
 * This api is use to verify token for each request,
 * when client requests with a token this API decodes that match with existing token  and send with
 * decoded object.
 * We set currUser i.e. current user to req object so we can access somewhere else.
 *
 */

let config = iniParser.get()
console.log(config);
async function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;
    try {
        if (true === wannaLogin(req.path)) return next()

        if (!authHeader) return res.status(401).json({message: "Authentication missing"});

        let token = authHeader.split(' ')[1];
        data = jwt.verify(token, config.credential.secret);
        logging.debug(`[data] >>>> ${JSON.stringify(data)}`)

        let user = await db.getUser(data.username)
        logging.info(`[checkExistUser] >>>> ${JSON.stringify(user)}`)

        if(!user || user === null) {
            return res.status(401).json({message: "Authentication failed"});
        }

        next();
    } catch (e) {
        logging.debug(`[verifyToken] >>>> ${JSON.stringify(e.stack)}`)

        return res.status(500).json({message: "Internal Server Error"});
    }
}

function wannaLogin(path) {
    let status = false
    switch(path) {
        case '/api/auth/register':
        case '/api/auth/login':
        case '/api/ping':
            status = true
            break

        default:
            status = false
    }

    return status
}

module.exports = verifyToken;
