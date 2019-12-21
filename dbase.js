const mysql = require('mysql');

const dbSql = {
   host: 'localhost',
   user: 'root',
   password: '',
   database: 'it100pir',
   port: 3306
};

function getDevices(dev, ws) {
	var cnx = mysql.createConnection(dbSql);
	cnx.connect((error) => { if(error) throw error; });
	try {
		cnx.query('SELECT id,node,nid,name FROM devices ORDER BY id', (error, result, fields) => {
	    	if( error ) throw error;
	    	else {
	    		var res = [];
	    		for (var i = 0; i < result.length; i++) {
	    			res.push({
	    				id: result[i].id,
	    				node: result[i].node,
	    				nid: result[i].nid,
	    				name: result[i].name
	    			});
	    		}
	    		dev.data = res;
	    		ws.send(JSON.stringify(dev));
	    	}
	    });
	}
	finally { cnx.end(); }
}

function getNetVars(nvs, ws) {
	var cnx = mysql.createConnection(dbSql);
	cnx.connect((error) => { if(error) throw error; });
	try {
		cnx.query('SELECT id,device,nvName,nvIndex,selector,type FROM nvdata ORDER BY device,nvIndex', (error, result, fields) => {
	    	if( error ) throw error;
	    	else {
	    		var res = [];
	    		for (var i = 0; i < result.length; i++) {
	    			res.push({
	    				id: result[i].id,
	    				device: result[i].device,
	    				nvName: result[i].nvName,
	    				nvIndex: result[i].nvIndex,
	    				selector: result[i].selector,
	    				type: result[i].type
	    			});
	    		}
	    		nvs.data = res;
	    		ws.send(JSON.stringify(nvs));
	    	}
	    });
	}
	finally { cnx.end(); }
}

function getDbselectOne(data, ws) {
	var cnx = mysql.createConnection(dbSql);
	cnx.connect((error) => { if(error) throw error; });
	try {
		cnx.query(`SELECT * FROM ${data.dbName} WHERE ${data.whr}`, (error, result, fields) => {
	    	if( error ) throw error;
	    	else {
	    		var res = {
	    			type: 'db.selectOne',
	    			dbName: data.dbName,
	    			data: result
	    		}
	    		ws.send(JSON.stringify(res));
	    	}
	    });
	}
	finally { cnx.end(); }
}

function dbUpdate(data) {
	var cnx = mysql.createConnection(dbSql);
	cnx.connect((error) => { if(error) throw error; });
	try {
		cnx.query(`UPDATE ${data.tbName} SET ${data.sets} WHERE ${data.whr}`,(error, result, fields) => {
			if( error ) throw error;
		})
	}
	finally { cnx.end(); }
}

function dbInsert(data, ws) {
	var cnx = mysql.createConnection(dbSql);
	cnx.connect((error) => { if(error) throw error; });
	try {
		cnx.query(`INSERT INTO ${data.tbName} (${data.fields}) VALUES (${data.values})`,(error, result, fields) => {
			if( error ) throw error;
			else {
				var res = {
					type: 'db.insert',
					tbName: data.tbName,
					id: result.insertId
				}
				ws.send(JSON.stringify(res));
			}
		})
	}
	finally { cnx.end(); }
}

exports.getDevices = getDevices;
exports.getNetVars = getNetVars;
exports.getDbselectOne = getDbselectOne;
exports.dbUpdate = dbUpdate;
exports.dbInsert = dbInsert;