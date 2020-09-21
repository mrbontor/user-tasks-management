'use strict';
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
        at_time: DataTypes.DATE,
        created_at: DataTypes.DATE,
        updated_at: DataTypes.DATE,
        status: DataTypes.INTEGER
    }, {
        tableName: 'tasks',
        timestamps: false,
        underscored: true,
    });

    Task.associate =  function associate(models) {
        Task.belongsTo(models.Task, {
            foreignKey: 'user_id'
        })
    }
    return Task;
}
