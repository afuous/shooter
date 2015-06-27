(function() {
	var dgid = function(id) {
		return document.getElementById(id);
	};
	
	var socket = io.connect();
	
	var canvas = document.getElementById("canvas");
	var ctx = canvas.getContext("2d");
	
	var LEFT = 0;
	var RIGHT = 1;
	var UP = 2;
	var DOWN = 3;
	var CENTER = 4;
	
	var playing = false;
	
	window.onkeydown = function(event) {
		if(!playing) return;
		var key = (event || window.event).keyCode;
		if(key == 37 || key == 65) {
			physics.keyDown(getSelf(), LEFT);
			socket.emit("keyDown", LEFT);
		}
		else if(key == 39 || key == 68) {
			physics.keyDown(getSelf(), RIGHT);
			socket.emit("keyDown", RIGHT);
		}
		else if(key == 38 || key == 87) {
			physics.keyDown(getSelf(), UP);
			socket.emit("keyDown", UP);
		}
		else if(key == 40 || key == 83) {
			physics.keyDown(getSelf(), DOWN);
			socket.emit("keyDown", DOWN);
		}
	};
	window.onkeyup = function(event) {
		if(!playing) return;
		var key = (event || window.event).keyCode;
		if(key == 37 || key == 65) {
			physics.keyUp(getSelf(), LEFT);
			socket.emit("keyUp", LEFT);
		}
		else if(key == 39 || key == 68) {
			physics.keyUp(getSelf(), RIGHT);
			socket.emit("keyUp", RIGHT);
		}
		else if(key == 38 || key == 87) {
			physics.keyUp(getSelf(), UP);
			socket.emit("keyUp", UP);
		}
		else if(key == 40 || key == 83) {
			physics.keyUp(getSelf(), DOWN);
			socket.emit("keyUp", DOWN);
		}
	};
	
	document.getElementById("form").onsubmit = function() {
		socket.emit("join", document.getElementById("name").value);
		return false;
	};
	
	document.getElementById("name").focus();
	
	document.oncontextmenu = function() {
		return !playing;
	}
	
	socket.on("start", function(obj) {
		if(obj.valid) {
			playing = true;
			game = obj.game;
			canvas.width = game.width;
			canvas.height = game.height;
			document.getElementById("table").width = game.width;
			document.getElementById("join").style.display = "none";
			document.getElementById("game").style.display = "block";
			document.getElementById("statsTable").style.display = "block";
			clearInterval(interval);
			interval = setInterval(function() {
				physics.run(players, game);
				draw();
			}, 10);
		}
		else {
			alert("Duplicate name");
		}
	});
	
	socket.on("disconnect", function() {
		document.getElementById("join").style.display = "block";
		document.getElementById("game").style.display = "none";
		document.getElementById("statsTable").style.display = "none";
		clearInterval(interval);
		playing = false;
	});
	
	socket.on("update", function(arr) {
		players = arr;
	});
	
	document.onmousedown = function(event) {
		if(!playing) return;
		if(event.which != 1) return;
		var x = event.x - canvas.offsetLeft - 1;
		var y = event.y - canvas.offsetTop - 1;
		physics.shoot(getSelf(), x, y);
		socket.emit("shoot", {
			x: x,
			y: y
		});
	};
	
	document.getElementById("name").onmousedown = function() {
		return true;
	};
	
	var players = [];
	var interval;
	var game;
	
	function getSelf() {
		for(var i = 0; i < players.length; i++) {
			if(players[i].self) {
				return players[i];
			}
		}
	}
	
	function draw() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		var table = document.createElement("table");
		if(players.length > 1) {
			table.appendChild(getRow(["", "Kills", "Deaths"]));
		}
		for(var i = 0; i < players.length; i++) {
			var player = players[i];
			ctx.fillStyle = player.self ? "blue" : "green";
			ctx.beginPath();
			ctx.arc(player.x, player.y, game.radius, 0, Math.PI * 2);
			ctx.fill();
			for(var j = 0; j < player.bullets.length; j++) {
				var bullet = player.bullets[j];
				ctx.beginPath();
				ctx.arc(bullet.x, bullet.y, game.bullets.radius, 0, Math.PI * 2);
				ctx.fill();
			}
			ctx.fillStyle = "black";
			ctx.font = "14px Arial";
			if(player.self) {
				document.getElementById("kills").innerHTML = "Kills: " + player.kills;
				document.getElementById("deaths").innerHTML = "Deaths: " + player.deaths;
				document.getElementById("ammo").innerHTML = "Ammo: " + player.ammo;
			}
			else {
				table.appendChild(getRow([player.name, player.kills, player.deaths]));
				ctx.textAlign = "center";
				var x = player.x;
				var y = player.y;
				x = player.x;
				if(y > 50) {
					y -= 25;
				}
				else {
					y += 35;
				}
				if(x < ctx.measureText(player.name).width / 2) {
					x = 5;
					ctx.textAlign = "left";
				}
				else if(x > game.width - ctx.measureText(player.name).width / 2) {
					x = game.width - 5;
					ctx.textAlign = "right";
				}
				ctx.fillText(player.name, x, y);
			}
		}
		document.getElementById("stats").innerHTML = "";
		document.getElementById("stats").appendChild(table);
	}
	
	function getRow(cells) {
		var tr = document.createElement("tr");
		for(var i = 0; i < cells.length; i++) {
			var td = document.createElement("td");
			td.width = "150";
			td.style.fontSize = "20px";
			td.innerHTML = String(cells[i]).replace("<", "&lt").replace(">", "&gt");
			tr.appendChild(td);
		}
		return tr;
	}
})();