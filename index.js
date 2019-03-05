const dontpad = require('dontpad-api');
var app = require('express')();
var http = require('http').Server(app); 
var io = require('socket.io')(http);

const dontPadTarget = '9567891101234';
const timer=60000;
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
			if(dateConf.toLocaleString('en-US', { hour: 'numeric', hour12: true }) != comp.toLocaleString('en-US', { hour: 'numeric', hour12: true })){
				dateConf = comp;
				io.emit('message', '******************************************************');
				resetAll();
				io.emit('message', '***************** Zerando contadores *****************');
				io.emit('message', '******************************************************');
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
			io.emit('err', new Date().toLocaleString('pt-BR',{timeZone: "America/Sao_Paulo"}) + ' - ' + err.code);
		    done();
		});
}

function emit4All(to = io) {
	to.emit('message', "##############################INIT###################################");
	to.emit('message', new Date().toLocaleString('pt-BR',{timeZone: "America/Sao_Paulo"}));
	for (var i = 0; i < cod.length; i++) {
		to.emit('message', cod[i]+' : '+percents[i]);
	}
	to.emit('message', "###############################END###################################");
}


function done() {
	setTimeout(function(){test()},timer);
}

app.get('/', function(req, res){
  res.sendFile(__dirname + '/home.html');
});

io.on('connection', function(socket){
  console.log('a user connected');
  emit4All(socket);
  socket.on('reset', function(msg){
	if(msg=='*****')
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



