var LEFT = 0;
var RIGHT = 1;
var UP = 2;
var DOWN = 3;
var CENTER = 4;

function run(players, game) {
	for(var i = 0; i < players.length; i++) {
		var player = players[i];
		if(player.horiz == LEFT) {
			player.dx -= player.dx < 0 ? game.accel : game.decel;
		}
		else if(player.horiz == RIGHT) {
			player.dx += player.dx > 0 ? game.accel : game.decel;
		}
		player.x += player.dx;
		if(player.x < game.radius) {
			player.x = game.radius;
			player.dx *= -game.bounce;
		}
		if(player.x > game.width - game.radius) {
			player.x = game.width - game.radius;
			player.dx *= -game.bounce;
		}
		
		if(player.vert == UP) {
			player.dy -= player.dy < 0 ? game.accel : game.decel;
		}
		else if(player.vert == DOWN) {
			player.dy += player.dy > 0 ? game.accel : game.decel;
		}
		player.y += player.dy;
		if(player.y < game.radius) {
			player.y = game.radius;
			player.dy *= -game.bounce;
		}
		if(player.y > game.height - game.radius) {
			player.y = game.height - game.radius;
			player.dy *= -game.bounce;
		}
		for(var j = 0; j < player.bullets.length; j++) {
			var bullet = player.bullets[j];
			bullet.x += game.bullets.speed * Math.cos(bullet.angle);
			bullet.y += game.bullets.speed * Math.sin(bullet.angle);
			switch(true) {
				case bullet.x < -game.bullets.radius:
				case bullet.x > game.width + game.bullets.radius:
				case bullet.y < -game.bullets.radius:
				case bullet.y > game.height + game.bullets.radius:
				player.bullets.splice(j--, 1);
			}
		}
		if(typeof(player.ammo) == "number") {
			player.ammoTimer++;
			if(player.ammoTimer == game.ammoRegen) {
				player.ammoTimer = 0;
				if(player.ammo < game.maxAmmo) {
					player.ammo++;
				}
			}
		}
	}
	var dist = function(a, b) {
		return Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));
	}
	for(var i = 0; i < players.length; i++) {
		for(var j = 0; j < players[i].bullets.length; j++) {
			for(var k = 0; k < players.length; k++) {
				if(i != k && dist(players[i].bullets[j], players[k]) < game.radius + game.bullets.radius) {
					players[i].kills++;
					players[k].deaths++;
					players[i].bullets.splice(j--, 1);
					break;
				}
			}
		}
	}
}

function keyDown(player, dir) {
	if(dir == LEFT && player.horiz != LEFT) {
		if(player.horiz == CENTER) {
			player.horiz = LEFT;
		}
		else if(player.horiz == RIGHT) {
			player.horiz = CENTER;
		}
	}
	else if(dir == RIGHT && player.horiz != RIGHT) {
		if(player.horiz == CENTER) {
			player.horiz = RIGHT;
		}
		else if(player.horiz == LEFT) {
			player.horiz = CENTER;
		}
	}
	else if(dir == UP && player.vert != UP) {
		if(player.vert == CENTER) {
			player.vert = UP;
		}
		else if(player.vert == DOWN) {
			player.vert = CENTER;
		}
	}
	else if(dir == DOWN && player.vert != DOWN) {
		if(player.vert == CENTER) {
			player.vert = DOWN;
		}
		else if(player.vert == UP) {
			player.vert = CENTER;
		}
	}
}

function keyUp(player, dir) {
	if(dir == LEFT && player.horiz != RIGHT) {
		if(player.horiz == CENTER) {
			player.horiz = RIGHT;
		}
		else if(player.horiz == LEFT) {
			player.horiz = CENTER;
		}
	}
	else if(dir == RIGHT && player.horiz != LEFT) {
		if(player.horiz == CENTER) {
			player.horiz = LEFT;
		}
		else if(player.horiz == RIGHT) {
			player.horiz = CENTER;
		}
	}
	else if(dir == UP && player.vert != DOWN) {
		if(player.vert == CENTER) {
			player.vert = DOWN;
		}
		else if(player.vert == UP) {
			player.vert = CENTER;
		}
	}
	else if(dir == DOWN && player.vert != UP) {
		if(player.vert == CENTER) {
			player.vert = UP;
		}
		else if(player.vert == DOWN) {
			player.vert = CENTER;
		}
	}
}

function shoot(player, x, y) {
	if(player.ammo > 0) {
		var angle = Math.atan((y - player.y) / (x - player.x));
		if(x < player.x) angle += Math.PI;
		player.bullets.push({
			x: player.x,
			y: player.y,
			angle: angle
		});
		player.ammo--;
	}
}

var physics = {
	run: run,
	keyDown: keyDown,
	keyUp: keyUp,
	shoot: shoot
};

if(typeof(exports) == "undefined") {
	window.physics = physics;
}
else {
	for(var key in physics) {
		exports[key] = physics[key];
	}
}