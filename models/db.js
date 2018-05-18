'use strict';

module.exports = (sequelize, DataTypes) => {
    var Db = sequelize.define('db', {
        Host: DataTypes.CHAR,
        Db: DataTypes.CHAR,
        User: DataTypes.CHAR,
        Select_priv: DataTypes.ENUM('value', 'another value'),
        Insert_priv: DataTypes.ENUM('value', 'another value'),
        Update_priv: DataTypes.ENUM('value', 'another value'),
        Delete_priv: DataTypes.ENUM('value', 'another value'),
        Create_priv: DataTypes.ENUM('value', 'another value'),
        Drop_priv: DataTypes.ENUM('value', 'another value'),
        Grant_priv: DataTypes.ENUM('value', 'another value'),
        References_priv: DataTypes.ENUM('value', 'another value'),
        Index_priv: DataTypes.ENUM('value', 'another value'),
        Alter_priv: DataTypes.ENUM('value', 'another value'),
        Create_tmp_table_priv: DataTypes.ENUM('value', 'another value'),
        Lock_tables_priv: DataTypes.ENUM('value', 'another value'),
        Create_view_priv: DataTypes.ENUM('value', 'another value'),
        Show_view_priv: DataTypes.ENUM('value', 'another value'),
        Create_routine_priv: DataTypes.ENUM('value', 'another value'),
        Alter_routine_priv: DataTypes.ENUM('value', 'another value'),
        Execute_priv: DataTypes.ENUM('value', 'another value'),
        Event_priv: DataTypes.ENUM('value', 'another value'),
        Trigger_priv: DataTypes.ENUM('value', 'another value')
    }, {
        underscored: true,
        freezeTableName: true,
        timestamps: false
    });

    Db.removeAttribute('id');
    Db.associate = models => {
        Db.addHook('beforeCreate', 'createdatabase', async(db, options) => {
            await sequelize.query(`CREATE DATABASE ${db['Db']}`);
            return db;
        });

        Db.addHook('afterCreate', 'createdatabase', async(db, options) => {
            await sequelize.query(`GRANT ALL PRIVILEGES ON \`${db['Db']}\`.* TO '${db['User']}'@'${db['Host']}'`);
            return db;
        });
    };

    return Db;
};