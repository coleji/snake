const TICK_MS = 350;
const TICK_MAX_SKEW = 10;

const TILE_WIDTH=35;

const GRID_WIDTH=10;

var frameCounter = 0;
var lastTick = 0;

enum Direction {
	UP,
	DOWN,
	LEFT,
	RIGHT
}

enum PlayState {
	PLAY,
	WIN,
	LOSE
}

const STARTING_POSITION = Math.floor(GRID_WIDTH/2 - 1);

var state = {
	direction: Direction.RIGHT,
	snakePosition: [STARTING_POSITION, STARTING_POSITION],
	applePosition: [1, 1],
	snakeTail: [] as number[][],
	usedTiles: {[STARTING_POSITION]: {[STARTING_POSITION]: true}},
	playState: PlayState.PLAY,
	stepsTakenDir: 0,
	priorDir: Direction.DOWN
};

type State = typeof state;

var canvas: HTMLCanvasElement = null;

function updateState(newState: State) {
	// if (newState.direction != state.direction) {
	// 	console.log(newState.direction);
	// }
	state = newState;
}

function randomApplePosition() {
	// figure out how many spots are left, generate a random number in that range, and walk through the grid counting off empty cells
	// until we find our winner
	const gridSize = GRID_WIDTH * GRID_WIDTH;
	const emptyCells = gridSize - (state.snakeTail.length + 1);
	const cellPosition = Math.floor(Math.random() * emptyCells);
	var emptyCellsSeen = 0;
	for (var i=0; i<GRID_WIDTH; i++) {
		for (var j=0; j<GRID_WIDTH; j++) {
			if (state.usedTiles[i] && state.usedTiles[i][j]) continue;
			if (emptyCellsSeen++ == cellPosition) return [i,j];
		}
	}
	return [-1, -1];
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

	// Add the current head position as the first tail position
	state.snakeTail.unshift(Object.assign({}, state.snakePosition));

	// If we just ate an apple, don't drop the last tail segment
	if (!ateApple) {
		state.snakeTail.pop()
	}

	state.snakePosition = nextPosition;
	state.stepsTakenDir++;

	// state.usedTiles = {[state.snakePosition[0]]: {[state.snakePosition[1]]: true}};
	state.usedTiles = {};
	state.snakeTail.forEach(([x,y]) => {
		state.usedTiles[x] = state.usedTiles[x] || {};
		state.usedTiles[x][y] = true;
	});

	if (state.usedTiles[state.snakePosition[0]] && state.usedTiles[state.snakePosition[0]][state.snakePosition[1]]) {
		// You ran into a body segment
		state.playState = PlayState.LOSE;
	} else {
		state.usedTiles[state.snakePosition[0]] = state.usedTiles[state.snakePosition[0]] || {};
		state.usedTiles[state.snakePosition[0]][state.snakePosition[1]] = true;
	}

	if (state.snakePosition[0] < 0 || state.snakePosition[0] >= GRID_WIDTH || state.snakePosition[1] < 0 || state.snakePosition[1] >= GRID_WIDTH) {
		// You hit a wall
		state.playState = PlayState.LOSE;
	}

	if (ateApple) {
		state.applePosition = randomApplePosition();
		if (state.applePosition[0] == -1 && state.applePosition[1] == -1) {
			// Nowhere left to put the apple!
			state.playState = PlayState.WIN
		}
	}
}

// If b abuts a, return the Direction that you would travel from a to get to b.  Else return null;
function compareTiles(a: number[], b: number[]) {
	if (b[0] == a[0]) {
		if (b[1] == a[1]+1) return Direction.DOWN;
		else if (b[1] == a[1]-1) return Direction.UP;
	}
	if (b[1] == a[1]) {
		if (b[0] == a[0]+1) return Direction.RIGHT;
		else if (b[0] == a[0]-1) return Direction.LEFT;
	}
	return null;
}

function tick() {
	const now = (new Date()).getTime();
	const skew = (now - lastTick) - TICK_MS;
	if (lastTick > 0 && Math.abs(skew) > TICK_MAX_SKEW) {
		console.log("Tick was " + Math.abs(skew) + " ms " + (skew > 0 ? "slow" : "fast"));
	}
	lastTick = now;
	tickAction();
	switch (state.playState) {
	case PlayState.PLAY:
		window.setTimeout(tick, TICK_MS);
		break;
	case PlayState.WIN:
		alert("You win!");
		break;
	case PlayState.LOSE:
		alert("You lose :(")
	}	
}

function draw() {
	
	var ctx = canvas.getContext('2d');
	ctx.strokeStyle = 'white';
	ctx.clearRect(0, 0, GRID_WIDTH*TILE_WIDTH, GRID_WIDTH*TILE_WIDTH); // clear canvas

	// render snake body segments, fill and borders
	ctx.fillStyle = 'rgb(180, 180, 180)';
	ctx.strokeStyle = 'black';
	ctx.lineWidth = 1;

	([state.snakePosition].concat(state.snakeTail)).forEach((tile, i, arr) => {
		const [x, y] = tile;
		var renderTop = true;
		var renderBottom = true;
		var renderLeft = true;
		var renderRight = true;

		const xPos = x*TILE_WIDTH;
		const yPos = y*TILE_WIDTH;

		if (i+1 < arr.length) {
			// for all but the tail end, check what side our aft neighbor is on, dont draw a border there
			const priorTile = arr[i+1];
			switch (compareTiles(tile, priorTile)) {
			case Direction.UP:
				renderTop = false;
				break;
			case Direction.DOWN:
				renderBottom = false;
				break;
			case Direction.LEFT:
				renderLeft = false;
				break;
			case Direction.RIGHT:
				renderRight = false;
				break;
			}
		}

		if (i>0) {
			// for all but the head, check what side our forward neighbor is on, dont draw a border there
			const nextTile = arr[i-1];
			switch (compareTiles(tile, nextTile)) {
			case Direction.UP:
				renderTop = false;
				break;
			case Direction.DOWN:
				renderBottom = false;
				break;
			case Direction.LEFT:
				renderLeft = false;
				break;
			case Direction.RIGHT:
				renderRight = false;
				break;
			}
			// dont fill the head with the tail color
			ctx.fillRect(xPos, yPos, TILE_WIDTH, TILE_WIDTH);
		}

		if (renderTop) {
			ctx.beginPath();
			ctx.moveTo(xPos, yPos);
			ctx.lineTo(xPos+TILE_WIDTH, yPos);
			ctx.stroke();
		}
		if (renderBottom) {
			ctx.beginPath();
			ctx.moveTo(xPos, yPos+TILE_WIDTH);
			ctx.lineTo(xPos+TILE_WIDTH, yPos+TILE_WIDTH);
			ctx.stroke();
		}
		if (renderLeft) {
			ctx.beginPath();
			ctx.moveTo(xPos, yPos);
			ctx.lineTo(xPos, yPos+TILE_WIDTH);
			ctx.stroke();
		}
		if (renderRight) {
			ctx.beginPath();
			ctx.moveTo(xPos+TILE_WIDTH, yPos);
			ctx.lineTo(xPos+TILE_WIDTH, yPos+TILE_WIDTH);
			ctx.stroke();
		}
	})

	// render apple
	ctx.fillStyle = 'rgb(200, 0, 0)';
	ctx.fillRect(state.applePosition[0]*TILE_WIDTH, state.applePosition[1]*TILE_WIDTH, TILE_WIDTH, TILE_WIDTH);

	// render snake head segment
	ctx.fillStyle = 'rgb(80, 80, 80)';
	ctx.fillRect(state.snakePosition[0]*TILE_WIDTH, state.snakePosition[1]*TILE_WIDTH, TILE_WIDTH, TILE_WIDTH);

	frameCounter++;
	window.requestAnimationFrame(draw)
}

function init() {
	canvas = document.getElementById("viewport") as HTMLCanvasElement;
	canvas.width = GRID_WIDTH * TILE_WIDTH;
	canvas.height = GRID_WIDTH * TILE_WIDTH;

	document.addEventListener("keydown", e => {
		const changingDir = {
			stepsTakenDir: 0,
			priorDir: state.direction
		}
		if (state.direction == Direction.LEFT || state.direction == Direction.RIGHT) {
			switch (e.key) {
			case "ArrowUp":
				if (state.priorDir == Direction.DOWN && state.stepsTakenDir == 0) return;
				updateState({ ...state, ...changingDir, direction: Direction.UP,  });
				break;
			case "ArrowDown":
				if (state.priorDir == Direction.UP && state.stepsTakenDir == 0) return;
				updateState({ ...state, ...changingDir, direction: Direction.DOWN });
				break;
			}
		}
		if (state.direction == Direction.UP || state.direction == Direction.DOWN) {
			switch (e.key) {
			case "ArrowLeft":
				if (state.priorDir == Direction.RIGHT && state.stepsTakenDir == 0) return;
				updateState({ ...state, ...changingDir, direction: Direction.LEFT });
				break;
			case "ArrowRight":
				if (state.priorDir == Direction.LEFT && state.stepsTakenDir == 0) return;
				updateState({ ...state, ...changingDir, direction: Direction.RIGHT });
				break;
			}
		}
	});

	window.setInterval(function() {
		// document.getElementById("fps-counter").innerHTML = String(frameCounter);
		frameCounter = 0;
	}, 1000);

	tick();
	window.requestAnimationFrame(draw);
}