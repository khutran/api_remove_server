#!/usr/bin/env node

var Q = require('q');
var program = require('commander');
var fs = require('fs');
var exec = require('child_process').exec;
var mysql = require('mysql');
var connection = mysql.createPool({
	host : 'localhost',
	user : 'root',
	password : 'xuankhu123s',
});



var domain = process.argv[2];
var urldir = '/var/www/web/'+ domain + '/workspace';
//process.chdir(urldir);


function checkenvwordpress(database){
	//var database = 'vicoders_'+ domain.replace(/\./gi, '_');
	var contentfile = '<?php\n' + '\$_ENV = [\n' + '   "DB_NAME" => "' + database + '",\n' + '   "DB_USER" => "' + "vmmsnew" + '",\n' + '   "DB_PASSWORD" => "' + "vicoders123s" + '",\n' + '   "DB_HOST" => "localhost",\n' + '];\n' + '?>';
	fs.readFile('./domain/.env', (err, data) => {
		if (err){
			fs.writeFile('.env', contentfile);
		}
		if (data){
			exec('rm -rf .env', function(err2, data2){
				if(!err2) fs.writeFile('.env', contentfile);
			});
		}
	});
}

function checkenvlaravel(database, callback){
	//var database = 'vicoders_'+ domain.replace(/\./gi, '_');
	var configdb = 'DB_CONNECTION=mysql\n' + 'DB_HOST=localhost\n' + 'DB_PORT=3306\n' + 'DB_DATABASE=' + database +'\n' + 'DB_USERNAME=vmmsnew\n' + 'DB_PASSWORD=vicoders123s';
	fs.readFile('.env.examp', function(err, content){
		if (err) throw err;
		fs.writeFile('.env', content.toString() + configdb, function(error){
			if (error) throw error;	
			return callback('suscess');
		});
	});

}

function creatdb(domain){
	var database = 'vicoders_'+ domain.replace(/\./gi, '_');
	var privile = "grant all privileges on " + "\`" + database + "\`" + "\." + "*" + " to " + "\'" + "vmmsnew" + "\'" + "@" + "\'" + "%" + "\'";
	return Q.Promise((res) => {
		connection.getConnection((error, connect) => {
			connect.query('create database ' + database, function(err, data){
				if (err)
					throw err;
				if (data)
					connect.release();
					connect.query(privile, function(error1, data1){
						if (error1) throw error1;
						return res({'connect':connect, 'database': database});
					
					});
			});
		});
	});
}

function replace(domain, framework){
switch (framework){

	case 'wordpress':
		creatdb(domain)
		.then(function(connect){
			var datas = connect.database;
			connect.connect.destroy(function(er){ if (er) throw er;});
			var imp = 'mysql -u root -pxuankhu123s '+ datas + ' < database/database.sql';
		        var connection = mysql.createPool({
       		         	host : 'localhost',
               		 	user : 'root',
	                	password : 'xuankhu123s',
	                	database : connect.database
	        	});
			checkenvwordpress(domain);
		       	exec(imp, function(err){
       		 	        if (err) throw err;
	       		 	connection.getConnection(function(errr, connectt){
					if (errr) throw errr;
					connectt.query('SELECT option_value FROM wp_options WHERE option_name = \'siteurl\'', function(error, results){
						if (error) throw error;
						if (results)
							exec('php srdb.cli.php -u root -pxuankhu123s -n ' + datas + ' -s ' + results[0].option_value + ' -r ' + domain + ' -h localhost', function(err2){ if(err2) throw err2;});
						connectt.destroy();
					});
				});
				});
			});
		break;
	case 'laravel':
		creatdb(domain)
		.then(function(connect){
                        var datas = connect.database;
                        connect.connect.destroy(function(er){ if (er) throw er;});
			
			checkenvlaravel(datas, (results) => {
				if (results == 'suscess'){
					exec('composer install', (err1) => {
						if (err1) throw err1;
					});
					exec('chmod -R 777 storage', (err2) => {
							if (err2) throw err2;
							exec('php artisan key:generate', (err3) => {
								exec('php artisan migrate');
							});
						});	
				}
			});	
		});	
		break;
	default:
		throw 'error systax';		
}
}

function checkframework(domain){
	var urldir = '/var/www/web/'+ domain + '/workspace';
	process.chdir(urldir);
	exec('find -name \"wp-admin\" -type d', function(err, stdout, stderr){
		if(err) throw err;
		if(stdout == ''){
			replace(domain, 'laravel');
		}else{
			replace(domain, 'wordpress');
		}
	});
}

checkframework(domain);
//replace(domain, 'laravel');
//checkenv();
