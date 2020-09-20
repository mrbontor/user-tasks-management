'use strict';
module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
            unique: true
        },
        name: DataTypes.STRING,
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        hash: DataTypes.STRING,
        salt: DataTypes.STRING,
        created_at: DataTypes.DATE,
        updated_at: DataTypes.DATE,
        status: DataTypes.STRING
    }, {
        tableName: 'users', // oauth_users
        timestamps: false,
        underscored: true,
    });

    // User.associate =  function associate(models) {
    //     User.hasMany(models.Transaksi, {
    //         foreignKey: 'user_id',
    //         allowNull: false
    //     })
    // }
    return User;
}
