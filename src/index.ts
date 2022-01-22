const TICK_MS = 700;
const TICK_MAX_SKEW = 10;

const TILE_WIDTH=10;

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
	snakePosition: [19, 19],
	applePosition: [10, 10]
};

type State = typeof state;

function updateState(newState: State) {
	console.log(newState)
	// if (newState.direction != state.direction) {
	// 	console.log(newState.direction);
	// }
	state = newState;
}

function init() {
	console.log("init")

	document.addEventListener("keydown", e => {
		console.log(e)
		switch (e.key) {
		case "ArrowUp":
			updateState({ ...state, direction: Direction.UP });
			break;
		case "ArrowDown":
			updateState({ ...state, direction: Direction.DOWN });
			break;
		case "ArrowLeft":
			updateState({ ...state, direction: Direction.LEFT });
			break;
		case "ArrowRight":
			updateState({ ...state, direction: Direction.RIGHT });
			break;
		}
	});

	window.setInterval(function() {
		document.getElementById("fps-counter").innerHTML = String(frameCounter);
		frameCounter = 0;
	}, 1000);

	tick();
	window.requestAnimationFrame(draw);
}

function tick() {
	const now = (new Date()).getTime();
	const skew = (now - lastTick) - TICK_MS;
	if (lastTick > 0 && Math.abs(skew) > TICK_MAX_SKEW) {
		console.log("Tick was " + Math.abs(skew) + " ms " + (skew > 0 ? "slow" : "fast"));
	}
	lastTick = now;
	console.log(state)
	tickAction();
	window.setTimeout(tick, TICK_MS)
}

function tickAction() {
	switch (state.direction) {
	case Direction.UP:
		updateState({ ...state, snakePosition: [state.snakePosition[0], state.snakePosition[1]-1]})
		break;
	case Direction.DOWN:
		updateState({ ...state, snakePosition: [state.snakePosition[0], state.snakePosition[1]+1]})
		break;
	case Direction.LEFT:
		updateState({ ...state, snakePosition: [state.snakePosition[0]-1, state.snakePosition[1]]})
		break;
	case Direction.RIGHT:
		updateState({ ...state, snakePosition: [state.snakePosition[0]+1, state.snakePosition[1]]})
		break;
	}
}

function draw() {
	const canvas = document.getElementById("viewport") as HTMLCanvasElement;
	var ctx = canvas.getContext('2d');

	ctx.clearRect(0, 0, 400, 400); // clear canvas

	ctx.fillStyle = 'rgb(80, 80, 80)';
	ctx.fillRect(state.snakePosition[0]*TILE_WIDTH, state.snakePosition[1]*TILE_WIDTH, TILE_WIDTH, TILE_WIDTH);
	
	ctx.fillStyle = 'rgb(200, 0, 0)';
	ctx.fillRect(state.applePosition[0]*TILE_WIDTH, state.applePosition[1]*TILE_WIDTH, TILE_WIDTH, TILE_WIDTH);

	frameCounter++;
	window.requestAnimationFrame(draw)
}