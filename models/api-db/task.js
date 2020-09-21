'use strict';
const util = require('../../libs/utils');

module.exports = (sequelize, DataTypes) => {
    const Task = sequelize.define('Task', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
            unique: true
        },
		name: DataTypes.STRING,
        description: DataTypes.STRING,
        user_id: DataTypes.INTEGER,
		start_time: DataTypes.TIME,
		end_time: DataTypes.TIME,
		start_at: {
			type: DataTypes.DATE,
			get(){
				return util.formatDateStandard(this.getDataValue('start_at'), true)
			}
		},
		end_at: {
			type: DataTypes.DATE,
			get(){
				return util.formatDateStandard(this.getDataValue('end_at'), true)
			}
		},
		created_at: {
			type: DataTypes.DATE,
			get(){
				return util.formatDateStandard(this.getDataValue('created_at'), true)
			}
		},
		forever: DataTypes.TINYINT,
		date_forever: {
			type: DataTypes.TEXT,
			// get() {
			// 	let val = {}
			// 	if (this.getDataValue("date_forever") != '') val = JSON.parse(JSON.stringify(this.getDataValue("date_forever")))
			// 	return val;
			// },
			set(value) {
				return this.setDataValue("date_forever", JSON.stringify(value))
			}
		},
		updated_at: {
			type: DataTypes.DATE,
			get(){
				return util.formatDateStandard(this.getDataValue('updated_at'), true)
			}
		},
        status: DataTypes.TINYINT
    }, {
        tableName: 'tasks',
        timestamps: false,
        underscored: true,
    });

    Task.associate =  function associate(models) {
        Task.belongsTo(models.User, {
            foreignKey: 'user_id'
        })
    }
    return Task;
}
