'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require('../../configs/config-sql.json')[env]['api-db'];
const logging = require('../../libs/logging');

var db = {};
var sequelize;

sequelize = new Sequelize(config.database, config.username, config.password, Object.assign({}, config, {
    pool:{
      max: 5,
      idle: 30000,
      acquire: 60000,
    },
    logging: (log) => { logging.debug(`[MYSQL] ${log}`) }
  }));

fs
    .readdirSync(__dirname)
    .filter(file => {
        return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
    })
    .forEach(file => {
        // var model = sequelize['import'](path.join(__dirname, file));
        let model = require(path.join(__dirname, file))(sequelize, Sequelize);
        db[model.name] = model;
    });

Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;

sequelize.sync()
    .then(result => {
        logging.info('[MYSQL] database connected successfully');
    })
    .catch(err => {
        logging.error('[MYSQL] connection database failed...' + err);
    });
module.exports = db;
