#!/usr/bin/env node
var WebSocketServer = require('websocket').server;
var http = require('http');

var sys = require('sys')
var exec = require('child_process').exec;

var fs = require('fs');
var XmlDocument = require('xmldoc').XmlDocument;

var server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});
server.listen(8080, function() {
    console.log((new Date()) + ' Server is listening on port 8080');
});

wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false
});

function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed.
  return true;
}

wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }

    var connection = request.accept('echo-protocol', request.origin);
    console.log((new Date()) + ' Connection accepted.');
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            var content = JSON.parse(message.utf8Data);
            if(content.type === 'request') {
                console.log("request received");
                var url = "http://static.musescore.com/"+content.payload.id+"/"+content.payload.secret+"/score_0.png";
                
                //Crop image and vectorize
                function puts(error, stdout, stderr) { sys.puts(stdout) }
                exec("convert -flatten "+url+" -crop "+content.payload.crop.width+"x"+content.payload.crop.height+"+"+content.payload.crop.x1+"+"+content.payload.crop.y1+"\! /Applications/XAMPP/htdocs/hackday/data/current.pbm; potrace --svg /Applications/XAMPP/htdocs/hackday/data/current.pbm", puts);

                fs.readFile('/Applications/XAMPP/htdocs/hackday/data/current.svg', 'ascii', function(err,data){
                    if(err) {
                        console.log("Could not open file"+ err);
                        process.exit(1);
                    }
                    var xmlData = new XmlDocument(data);
                    var pathOnlyXML = '';
                    xmlData.eachChild(function(g) {
                        g.eachChild(function(path) {
                            pathOnlyXML += '<path d="'+ path.attr.d +'" />';
                        });
                    });
                    connection.sendUTF(pathOnlyXML);
                    console.log(pathOnlyXML);
                });

            }
        }
        else if (message.type === 'binary') {
            console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
            connection.sendBytes(message.binaryData);
        }
    });
    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});