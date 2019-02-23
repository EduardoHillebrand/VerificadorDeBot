const dontpad = require('dontpad-api');
var app = require('express')();
var http = require('http').Server(app); 
var io = require('socket.io')(http);
require('dotenv').config();

const dontPadTarget = 'treinobatalhadebots';
const timer=10000;
var cod = [];
var count = [];
var percents = [];
var dateConf = new Date();


function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

function resetAll() {
	cod = [];
	count = [];
	percents = [];
}

function test() {
	dontpad.readContent(dontPadTarget)
		.then(conteudo => {
			let comp = new Date();
			if(dateConf.getHours() != comp.getHours()){
				dateConf = comp;
				io.emit('message', '**********************************************************');
				resetAll();
				io.emit('message', '***************** Zerando contadores *****************');
				io.emit('message', '**********************************************************');
			}
		    status = conteudo == cod ;
		    let pos = cod.indexOf(conteudo);
		    if(pos == -1){
		    	cod.push(conteudo);
		    	pos = cod.indexOf(conteudo);
		    	count[pos] = 0;
		    }
		    count[pos] ++;
		    let total = count.reduce(function(accumulator, a) {
    			return accumulator + a;
			})
		    for (var i = 0; i < count.length; i++) {
		    	let percent = (100/total)*count[i];
		    	percents[i] = parseFloat(Math.round(percent * 100) / 100).toFixed(2)+"%";
		    }
		    console.log(percents);
		    emit4All();
		    done();
		}).catch(err => { 
			console.log('err',err);
			io.emit('err', new Date().toString() + ' - ' + err.code);
		    done();
		});
}

function emit4All() {
	io.emit('message', "##############################INIT###################################");
	io.emit('message', new Date().toString());
	for (var i = 0; i < cod.length; i++) {
		io.emit('message', cod[i]+' : '+percents[i]);
	}
	io.emit('message', "###############################END###################################");
}


function done() {
	setTimeout(function(){test()},timer);
}

app.get('/', function(req, res){
  res.sendFile(__dirname + '/home.html');
});

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('reset', function(msg){
	if(msg==process.env.clearPassword)
		dateConf = new Date(0);  	
  });
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});

http.listen(3000, function(){
  test();
  console.log('listening on *:3000');
});



