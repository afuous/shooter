"use strict";

let http = require("http");
let io = require("socket.io");
let fs = require("fs");
let url = require("url");
let physics = require("./physics");

let server = http.createServer(function(req, res) {
	let path = url.parse(req.url).pathname.substring(1);
	if(path == "") {
		res.end(fs.readFileSync("index.html"));
	}
	else if(~["script.js", "socketio.js", "physics.js"].indexOf(path)) {
		res.end(fs.readFileSync(path));
	}
	else res.end("404");
});
server.listen(process.argv[2] || 80);

const game = {
	width: 800,
	height: 600,
	accel: 0.05,
	decel: 0.15,
	radius: 20,
	bounce: 0.2,
	bullets: {
		speed: 10,
		radius: 10
	},
	maxAmmo: 20,
	ammoRegen: 50
}

const LEFT = 0;
const RIGHT = 1;
const UP = 2;
const DOWN = 3;
const CENTER = 4;

let players = [];

function update() {
	for(let player of players) {
		player.socket.emit("update", players.map(p => ({
			x: p.x,
			y: p.y,
			dx: p.dx,
			dy: p.dy,
			name: p.name,
			horiz: p.horiz,
			vert: p.vert,
			bullets: p.bullets,
			kills: p.kills,
			deaths: p.deaths,
			ammo: p == player ? p.ammo : undefined,
			ammoTimer: p == player ? p.ammoTimer : undefined,
			self: p == player
		})));
	}
}

setInterval(function() {
	physics.run(players, game);
}, 10);

io.listen(server).on("connection", function(socket) {
	socket.on("join", function(name) {
		name = name.trim();
		if(name.length == 0 || players.some(player => socket == player.socket)) return;
		name = name.substring(0, 25);
		if(players.some(player => name == player.name)) {
			socket.emit("start", {
				valid: false
			});
		}
		else {
			players.push({
				socket: socket,
				x: game.radius + Math.random() * (game.width - 2 * game.radius),
				y: game.radius + Math.random() * (game.height - 2 * game.radius),
				dx: 0,
				dy: 0,
				name: name,
				horiz: CENTER,
				vert: CENTER,
				bullets: [],
				kills: 0,
				deaths: 0,
				ammo: Math.floor(game.maxAmmo / 2),
				ammoTimer: 0
			});
			socket.emit("start", {
				valid: true,
				game: game
			});
			update();
			//process.stdout.write(String.fromCharCode(7));
		}
	});
	
	socket.on("disconnect", function() {
		players = players.filter(player => socket != player.socket);
		update();
	});
	
	socket.on("keyDown", function(dir) {
		for(let player of players.filter(player => socket == player.socket)) {
			physics.keyDown(player, dir);
		}
		update();
	});
	
	socket.on("keyUp", function(dir) {
		for(let player of players.filter(player => socket == player.socket)) {
			physics.keyUp(player, dir);
		}
		update();
	});
	
	socket.on("shoot", function(obj) {
		for(let player of players.filter(player => socket == player.socket)) {
			physics.shoot(player, obj.x, obj.y);
		}
		update();
	});
});