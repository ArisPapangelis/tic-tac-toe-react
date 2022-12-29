
import './Game.css';
import React, {useState, useCallback} from 'react';

function Square(props) {
	return (
		<button className={props.classOfSquare} onClick={props.onClick}>
			{props.value}
		</button>
	);
}

function Board(props) {
	const numberOfRows = 3;
	const numberOfColumns = 3;
	//Using for loops
	// const boardToRender = [];
	// for (let i=0;i<numberOfRows;i++) {
	//   const rowToRender = [];
	//   for (let j=0;j<numberOfColumns;j++) {
	//     rowToRender.push(this.renderSquare(numberOfRows*i+j));
	//   }
	//   boardToRender.push(<div className="board-row">{rowToRender}</div>);
	// }

	//Using map
	const boardToRender = [...Array(numberOfRows).keys()].map((i) => (
		<div className="board-row">
			{[...Array(numberOfColumns).keys()].map((j) =>
				renderSquare(props, 3 * i + j)
			)}
		</div>
	));
	return <div>{boardToRender}</div>;
}

function renderSquare(props, i) {
	return (
		<Square
			classOfSquare={props.classOfSquare[i]}
			value={props.squares[i]}
			onClick={(e) => props.onClick(i)}
		/>
	);
}

function Game() {

	const [history, setHistory] = useState([
		{
			squares: Array(9).fill(null),
		},
	]);
	const [stepNumber, setStepNumber] = useState(0);
	const [xIsNext, setXIsNext] = useState(true);
	const [boldMove, setBoldMove] = useState(0);
	const [sortAscending, setSortAscending] = useState(true);
	const [classOfSquares, setClassOfSquares] = useState(Array(9).fill("square"));

	const calculateWinner = useCallback((squares, classOf) => {
		const lines = [
			[0, 1, 2],
			[3, 4, 5],
			[6, 7, 8],
			[0, 3, 6],
			[1, 4, 7],
			[2, 5, 8],
			[0, 4, 8],
			[2, 4, 6],
		];
		for (let i = 0; i < lines.length; i++) {
			const [a, b, c] = lines[i];
			if (
				squares[a] &&
				squares[a] === squares[b] &&
				squares[a] === squares[c]
			) {
				if (classOf) {
					let winningClassOfSquares = classOfSquares.slice();
					[a, b, c].map((i) => (winningClassOfSquares[i] = "squareBold"));
					return winningClassOfSquares;
				} else {
					return squares[a];
				}
			}
		}
		return null;
	}, [classOfSquares]);


	const handleClick = useCallback((i) => {
		const historyAtStep = history.slice(0, stepNumber + 1);
		const current = historyAtStep[historyAtStep.length - 1];
		const squares = current.squares.slice();

		if (calculateWinner(squares, false) || squares[i]) {
			return;
		}

		squares[i] = xIsNext ? "X" : "O";

		if (calculateWinner(squares, false)) {
			setClassOfSquares(calculateWinner(squares, true));
		}

		setHistory(historyAtStep.concat([
			{
				squares: squares,
			},
		]));
		setStepNumber(historyAtStep.length);
		setXIsNext(!xIsNext);

		setBoldMove(stepNumber+1);
	}, [history, stepNumber, xIsNext, calculateWinner]);


	const jumpTo = useCallback((stepNo) => {
		setBoldMove(stepNo);
		setStepNumber(stepNo);
		setXIsNext(stepNo % 2 === 0);
		setClassOfSquares(Array(9).fill("square"));

		if (calculateWinner(history[stepNo].squares, false)) {
			setClassOfSquares(calculateWinner(history[stepNo].squares, true));
		}
	}, [history, calculateWinner]);


	const sortToggle = useCallback(() => {
		setSortAscending(!sortAscending);
	}, [sortAscending]);


	const isDraw = useCallback((squares) => {
		if (!calculateWinner(squares, false) && !squares.includes(null)) {
			return true;
		}
		return false;
	}, [calculateWinner]);

	
	const historyNow = history;
	const current = historyNow[stepNumber];
	const winner = calculateWinner(current.squares, false);

	const moves = historyNow.map((step, move) => {
		const desc = move
			? "Go to move #" + move + calculateMovePosition(step, move, historyNow)
			: "Go to game start";
		return (
			<li key={move.toString()}>
				<button onClick={() => jumpTo(move)}>
					{boldMove === move ? <b>{desc}</b> : desc}
				</button>
			</li>
		);
	});

	if (!sortAscending) {
		moves.reverse();
	}

	let status;
	if (winner) {
		status = "Winner: " + winner;
	} else {
		status = "Next player: " + (xIsNext ? "X" : "O");
	}

	if (isDraw(current.squares)) {
		status = "No moves left, the game is a draw";
	}

	return (
		<div className="game">
			<div className="game-board">
				<Board
					classOfSquare={classOfSquares}
					squares={current.squares}
					onClick={(i) => handleClick(i)}
				/>
			</div>
			<div className="game-info">
				<div>{status}</div>
				<button onClick={() => sortToggle()}>
					Change sorting order
				</button>
				<ol>{moves}</ol>
			</div>
		</div>
	);
}

function calculateMovePosition(step, move, history) {
	const previousMoveState = history[move - 1].squares;
	for (let i = 0; i < 9; i++) {
		if (previousMoveState[i] !== step.squares[i]) {
			return " Row: " + Math.floor(i / 3) + " Col: " + (i % 3);
		}
	}
}

export default Game;
