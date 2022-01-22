const TICK_MS = 350;
const TICK_MAX_SKEW = 10;

const TILE_WIDTH=20;

const GRID_WIDTH=20;

var frameCounter = 0;
var lastTick = 0;

enum Direction {
	UP,
	DOWN,
	LEFT,
	RIGHT
}

var state = {
	direction: Direction.RIGHT,
	length: 5,
	snakePosition: [9, 9],
	applePosition: [8, 8],
	snakeTail: [] as number[][]
};

type State = typeof state;

function updateState(newState: State) {
	// if (newState.direction != state.direction) {
	// 	console.log(newState.direction);
	// }
	state = newState;
}

function randomApplePosition() {
	//var i = 0;
	while(true) {
		const position = [Math.floor(Math.random() * GRID_WIDTH), Math.floor(Math.random() * GRID_WIDTH)];
		return position;
	}
}

function tickAction() {
	const nextPosition = (function() {
		switch (state.direction) {
		case Direction.UP:
			return [state.snakePosition[0], state.snakePosition[1]-1];
			break;
		case Direction.DOWN:
			return [state.snakePosition[0], state.snakePosition[1]+1];
			break;
		case Direction.LEFT:
			return [state.snakePosition[0]-1, state.snakePosition[1]];
			break;
		case Direction.RIGHT:
			return [state.snakePosition[0]+1, state.snakePosition[1]];
			break;
		}
	}());
	const ateApple = nextPosition[0] == state.applePosition[0] && nextPosition[1] == state.applePosition[1];

	state.snakeTail.unshift(Object.assign({}, state.snakePosition));

	if (ateApple) {
		state.applePosition = randomApplePosition();
	} else {
		state.snakeTail.pop()
	}

	state.snakePosition = nextPosition;
}

function tick() {
	const now = (new Date()).getTime();
	const skew = (now - lastTick) - TICK_MS;
	if (lastTick > 0 && Math.abs(skew) > TICK_MAX_SKEW) {
		console.log("Tick was " + Math.abs(skew) + " ms " + (skew > 0 ? "slow" : "fast"));
	}
	lastTick = now;
	tickAction();
	window.setTimeout(tick, TICK_MS)
}

function draw() {
	const canvas = document.getElementById("viewport") as HTMLCanvasElement;
	var ctx = canvas.getContext('2d');

	ctx.clearRect(0, 0, 400, 400); // clear canvas
	
	// render apple
	ctx.fillStyle = 'rgb(200, 0, 0)';
	ctx.fillRect(state.applePosition[0]*TILE_WIDTH, state.applePosition[1]*TILE_WIDTH, TILE_WIDTH, TILE_WIDTH);

	// render snake head
	ctx.fillStyle = 'rgb(80, 80, 80)';
	ctx.fillRect(state.snakePosition[0]*TILE_WIDTH, state.snakePosition[1]*TILE_WIDTH, TILE_WIDTH, TILE_WIDTH);

	// render snake tail
	ctx.fillStyle = 'rgb(180, 180, 180)';
	state.snakeTail.forEach(([x, y]) => {
		ctx.fillRect(x*TILE_WIDTH, y*TILE_WIDTH, TILE_WIDTH, TILE_WIDTH);
	})

	frameCounter++;
	window.requestAnimationFrame(draw)
}

function init() {
	console.log("init")

	document.addEventListener("keydown", e => {
		if (state.direction == Direction.LEFT || state.direction == Direction.RIGHT) {
			switch (e.key) {
			case "ArrowUp":
				updateState({ ...state, direction: Direction.UP });
				break;
			case "ArrowDown":
				updateState({ ...state, direction: Direction.DOWN });
				break;
			}
		}
		if (state.direction == Direction.UP || state.direction == Direction.DOWN) {
			switch (e.key) {
			case "ArrowLeft":
				updateState({ ...state, direction: Direction.LEFT });
				break;
			case "ArrowRight":
				updateState({ ...state, direction: Direction.RIGHT });
				break;
			}
		}

	});

	window.setInterval(function() {
		document.getElementById("fps-counter").innerHTML = String(frameCounter);
		frameCounter = 0;
	}, 1000);

	tick();
	window.requestAnimationFrame(draw);
}