const fs = require('fs');
const iniParser = require('./libs/iniParser')
const logging = require('./libs/logging')
const args = require('minimist')(process.argv.slice(2));
const bodyParser = require('body-parser')
const express = require('express')
const env = process.env.NODE_ENV || 'development'
const app = express()

process.env.TZ = 'Asia/Jakarta'
// default config if config file is not provided
let config = {
    log: {
        path: "var/log/",
        level: "debug"
    }
}

if (args.h || args.help) {
    // TODO: print USAGE
    console.log("Usage: node " + __filename + " --config");
    process.exit(-1);
}

// overwrite default config with config file
let configFile = (env === 'production') ? args.c || args.config || './configs/config.user.task.api.prod.ini' : args.c || args.config || './configs/config.user.task.api.prod.ini'
// if (env === 'production') {
//     configFile = args.c || args.config || './configs/config.chat.api.prod.ini'
// } else {
//     configFile = args.c || args.config || './configs/config.chat.api.dev.ini'
// }
config = iniParser.init(config, configFile, args)
config.log.level = args.logLevel || config.log.level

const take_port = config.app.port;
const port = take_port || process.env.PORT;

// Initialize logging library
logging.init({
    path: config.log.path,
    level: config.log.level
})

logging.info(`[CONFIG] ${JSON.stringify(iniParser.get())}`)
const userChecking = require('./controllers/middleware')

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.use(function(err, req, res, next) {
    if (err) {
        logging.error('[MIDDLEWAREERROR] ' + JSON.stringify(err));
        res.status(500);
        let response = {
            status: 500,
            errors: [err.message]
        };
        res.json(response);
    } else {
        next();
    }
});


/**
 * [middleware]
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
// auth.checkAuthorization
app.use(userChecking)

const routes = require('./router/router');
routes(app);

app.listen(port);
logging.info('[app] API-SERVICE USER TASKS MANAGEMENT SYSTEM STARTED on ' + port);
