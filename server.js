var express = require('express.io');
var app = express();
var fs = require('fs');

var PORT = 3000

var options = {
	key: fs.readFileSync('./.encrypt/privkey.pem'),
	cert: fs.readFileSync('./.encrypt/cert.pem')
}

app.https(options).io();

//=====================================================================
console.log('server started on port ' + PORT);

//Procura por arquivos estáticos em public/
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
	res.render('index.ejs');
});

//Mensagem de broadcast para informar a entrada de um usuário no chat
app.io.route('ready', function(req){
	//Join à chat_room
	req.io.join(req.data.chat_room);
	//Join à signal_room
	req.io.join(req.data.signal_room);
	//Join à files_room
	req.io.join(req.data.files_room);
	//Informa o Join de um client à room
	app.io.room(req.data).broadcast('announce', {
		message: 'New client in the ' + req.data + ' room.'
	});
});

//Mensagem nomeada, possui um autor
app.io.route('send', function(req){
	app.io.room(req.data.room).broadcast('message', {
		message: req.data.message,
		author: req.data.author,
		color: req.data.color
	});
});

//Route utilizada para handshake
app.io.route('signal', function(req){
	//req é utilizado aqui com broadcast apenas para que o proprio usuário 
	//não veja suas próprias mensagens.
	req.io.room(req.data.room).broadcast('signaling_message', {
		type: req.data.type,
		message: req.data.message
	});
});

//Route utilizada para transferir arquivos
app.io.route('files', function(req){
	req.io.room(req.data.room).broadcast('files', {
		filename: req.data.filename,
		filesize: req.data.filesize
	});
});

app.listen(PORT, "0.0.0.0");

//var server = https.createServer(options, app).listen(PORT, "0.0.0.0");
//var server = express.createServer(options, app).listen(PORT, "0.0.0.0");


