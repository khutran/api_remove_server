'use strict';
require('dotenv').config()

module.exports = (sequelize, DataTypes) => {
    var User = sequelize.define('user', {
        Host: DataTypes.CHAR,
        User: DataTypes.CHAR,
        Select_priv: DataTypes.ENUM('value', 'another value'),
        Insert_priv: DataTypes.ENUM('value', 'another value'),
        Update_priv: DataTypes.ENUM('value', 'another value'),
        Delete_priv: DataTypes.ENUM('value', 'another value'),
        Create_priv: DataTypes.ENUM('value', 'another value'),
        Drop_priv: DataTypes.ENUM('value', 'another value'),
        Reload_priv: DataTypes.ENUM('value', 'another value'),
        Shutdown_priv: DataTypes.ENUM('value', 'another value'),
        Process_priv: DataTypes.ENUM('value', 'another value'),
        File_priv: DataTypes.ENUM('value', 'another value'),
        Grant_priv: DataTypes.ENUM('value', 'another value'),
        References_priv: DataTypes.ENUM('value', 'another value'),
        Index_priv: DataTypes.ENUM('value', 'another value'),
        Alter_priv: DataTypes.ENUM('value', 'another value'),
        Show_db_priv: DataTypes.ENUM('value', 'another value'),
        Super_priv: DataTypes.ENUM('value', 'another value'),
        Create_tmp_table_priv: DataTypes.ENUM('value', 'another value'),
        Lock_tables_priv: DataTypes.ENUM('value', 'another value'),
        Execute_priv: DataTypes.ENUM('value', 'another value'),
        Repl_slave_priv: DataTypes.ENUM('value', 'another value'),
        Repl_client_priv: DataTypes.ENUM('value', 'another value'),
        Create_view_priv: DataTypes.ENUM('value', 'another value'),
        Show_view_priv: DataTypes.ENUM('value', 'another value'),
        Create_routine_priv: DataTypes.ENUM('value', 'another value'),
        Alter_routine_priv: DataTypes.ENUM('value', 'another value'),
        Create_user_priv: DataTypes.ENUM('value', 'another value'),
        Event_priv: DataTypes.ENUM('value', 'another value'),
        Trigger_priv: DataTypes.ENUM('value', 'another value'),
        Create_tablespace_priv: DataTypes.ENUM('value', 'another value'),
        ssl_type: DataTypes.ENUM('value', 'another value'),
        ssl_cipher: { type: DataTypes.BLOB, defaultValue: '' },
        x509_issuer: { type: DataTypes.BLOB, defaultValue: '' },
        x509_subject: { type: DataTypes.BLOB, defaultValue: '' },
        max_questions: DataTypes.INTEGER,
        max_updates: DataTypes.INTEGER,
        max_connections: DataTypes.INTEGER,
        max_user_connections: DataTypes.INTEGER,
        plugin: DataTypes.CHAR,
        authentication_string: DataTypes.TEXT,
        password_expired: DataTypes.ENUM('value', 'another value'),
        password_last_changed: DataTypes.TIME,
        password_lifetime: DataTypes.SMALLINT,
        account_locked: DataTypes.ENUM('value', 'another value')
    }, {
        underscored: true,
        freezeTableName: true,
        timestamps: false
    });

    User.removeAttribute('id');
    User.associate = models => {
        User.addHook('beforeCreate', 'createuser', async(user, options) => {
            let newPass = await sequelize.query(`SELECT PASSWORD('${user['authentication_string']}')`, { type: sequelize.QueryTypes.SELECT });
            user['authentication_string'] = newPass[0][`PASSWORD('${user['authentication_string']}')`];
            return user;
        });

        User.addHook('afterCreate', 'createuser', async(user, options) => {
            await sequelize.query(`GRANT USAGE ON *.* TO '${user['User']}'@'${process.env['MYSQL_HOST_USER']}' REQUIRE NONE WITH MAX_QUERIES_PER_HOUR 0 MAX_CONNECTIONS_PER_HOUR 0 MAX_UPDATES_PER_HOUR 0 MAX_USER_CONNECTIONS 0`);
            await sequelize.query(`FLUSH PRIVILEGES`);
            await sequelize.query(`CREATE DATABASE ${user['User']}_db`);
            await sequelize.query(`GRANT ALL PRIVILEGES ON \`${user['User']}_db\`.* TO '${user['User']}'@'${user['Host']}'`);
            await sequelize.query(`GRANT ALL PRIVILEGES ON \`${user['User']}_db\`.* TO '${process.env['MYSQL_BACKUP']}'@'${process.env['MYSQL_HOST_USER']}'`);
            return user;
        });

        User.addHook('afterDestroy', 'deleteuser', async(user, options) => {
            await sequelize.query(`DROP DATABASE ${user['User']}_db`);
            await models.db.destroy({
                where: { User: user['User'] }
            });
            return user;
        })
    };

    return User;
};