import "./Game.css";
import React from "react";
import ReactDOM from "react-dom/client";

function Square(props) {
	return (
		<button className={props.classOfSquare} onClick={props.onClick}>
			{props.value}
		</button>
	);
}

class Board extends React.Component {
	renderSquare(i) {
		return (
			<Square
				classOfSquare={this.props.classOfSquare[i]}
				value={this.props.squares[i]}
				onClick={(e) => this.props.onClick(i)}
			/>
		);
	}

	render() {
		//Using for loops
		const numberOfRows = 3;
		const numberOfColumns = 3;
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
					this.renderSquare(3 * i + j)
				)}
			</div>
		));

		return <div>{boardToRender}</div>;
	}
}

class Game extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			history: [
				{
					squares: Array(9).fill(null),
				},
			],
			stepNumber: 0,
			xIsNext: true,
			boldMove: 0,
			sortAscending: true,
			classOfSquares: Array(9).fill("square"),
		};
		this.handleClick = this.handleClick.bind(this);
	}

	handleClick(i) {
		const history = this.state.history.slice(0, this.state.stepNumber + 1);
		const current = history[history.length - 1];
		const squares = current.squares.slice();

		if (this.calculateWinner(squares, false) || squares[i]) {
			return;
		}

		squares[i] = this.state.xIsNext ? "X" : "O";

		if (this.calculateWinner(squares, false)) {
			this.setState({
				classOfSquares: this.calculateWinner(squares, true),
			});
		}

		this.setState({
			history: history.concat([
				{
					squares: squares,
				},
			]),
			stepNumber: history.length,
			xIsNext: !this.state.xIsNext,
		});

		this.setState({
			boldMove: this.state.stepNumber + 1,
		});
	}

	jumpTo(stepNo) {
		this.setState({
			boldMove: stepNo,
			stepNumber: stepNo,
			xIsNext: stepNo % 2 === 0,
			classOfSquares: Array(9).fill("square"),
		});

		if (this.calculateWinner(this.state.history[stepNo].squares, false)) {
			this.setState({
				classOfSquares: this.calculateWinner(
					this.state.history[stepNo].squares,
					true
				),
			});
		}
	}

	sortToggle() {
		this.setState({
			sortAscending: !this.state.sortAscending,
		});
	}

	calculateWinner(squares, classOf) {
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
					let winningClassOfSquares = this.state.classOfSquares.slice();
					[a, b, c].map((i) => (winningClassOfSquares[i] = "squareBold"));
					return winningClassOfSquares;
				} else {
					return squares[a];
				}
			}
		}
		return null;
	}

	isDraw(squares) {
		if (!this.calculateWinner(squares, false) && !squares.includes(null)) {
			return true;
		}
		return false;
	}

	render() {
		const history = this.state.history;
		const current = history[this.state.stepNumber];
		const winner = this.calculateWinner(current.squares, false);

		const moves = history.map((step, move) => {
			const desc = move
				? "Go to move #" + move + calculateMovePosition(step, move, history)
				: "Go to game start";
			return (
				<li key={move.toString()}>
					<button onClick={() => this.jumpTo(move)}>
						{this.state.boldMove === move ? <b>{desc}</b> : desc}
					</button>
				</li>
			);
		});

		if (!this.state.sortAscending) {
			moves.reverse();
		}

		let status;
		if (winner) {
			status = "Winner: " + winner;
		} else {
			status = "Next player: " + (this.state.xIsNext ? "X" : "O");
		}

		if (this.isDraw(current.squares)) {
			status = "No moves left, the game is a draw";
		}

		return (
			<div className="game">
				<div className="game-board">
					<Board
						classOfSquare={this.state.classOfSquares}
						squares={current.squares}
						onClick={(i) => this.handleClick(i)}
					/>
				</div>
				<div className="game-info">
					<div>{status}</div>
					<button onClick={() => this.sortToggle()}>
						Change sorting order
					</button>
					<ol>{moves}</ol>
				</div>
			</div>
		);
	}
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
