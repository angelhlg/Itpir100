const express = require('express');
const WebSocket = require('ws');
const db = require('./dbase');

const app = express();

const routes = require("./public/routes");
app.use(routes);
app.use("/static", express.static(__dirname + '/public/static'));

const server = require('http').Server(app);
const PORT = process.env.PORT || 24072;
server.listen(PORT);


const wss = new WebSocket.Server({ server: server });

var hrwServer = null;

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
  	var msg = JSON.parse(message)
    console.log(msg);
  	switch(msg.type) {
  		case 'myID':
    			if (msg.data === 'HARDWARE') {
            hrwServer = ws;
            wss.clients.forEach(function each(client) {
              if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({type: 'lonReconnect'}));
              }
            });
          }
    		break;
  		case 'db.getDevices':
    			var dev = {
  				type: 'db.getDevices',
  				queryid: msg.queryid,
  				data: []
  			};
  			db.getDevices(dev, ws);
    		break;
  		case 'db.getNetVars':
    			var nvs = {
  				type: 'db.getNetVars',
  				queryid: msg.queryid,
  				data: []
  			};
  			db.getNetVars(nvs, ws);
    		break;
      case 'db.selectOne':
        db.getDbselectOne(msg, ws);
        break;
      case 'db.update':
        db.dbUpdate(msg);
        break;
      case 'db.insert':
        db.dbInsert(msg, ws);
        break;
      case 'getLonState':
        if (hrwServer && hrwServer.readyState === WebSocket.OPEN) hrwServer.send(message);
        else {
          var msg = { type: "network_status", data: { niList: [], currNi: '', domId: '', domIdLen: 0, node: 0, subnet: 0 } }
          ws.send(JSON.stringify(msg));
        }
        break;
  		default:
  			if (ws === hrwServer) {
  				wss.clients.forEach(function each(client) {
  					if (client !== ws && client.readyState === WebSocket.OPEN) {
  						client.send(message);
  					}
  				});
  			}
  			else {
  				if (hrwServer && hrwServer.readyState === WebSocket.OPEN) hrwServer.send(message);
  			}
  		  break;
  	}
  });

  ws.on('close', function(evt) {
    if (hrwServer && ws === hrwServer) {
      var msg = { type: "network_status", data: { niList: [], currNi: '', domId: '', domIdLen: 0, node: 0, subnet: 0 } }
      wss.clients.forEach(function each(client) {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(msg));
        }
      });
    }
  });

  ws.send(JSON.stringify({
  	type: 'wellcome',
  	data: 'Bienvenido al Servidor Remoto, listo para atender sus peticiones!'
  }));
});

