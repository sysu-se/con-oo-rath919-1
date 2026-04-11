import { Sudoku } from './sudoku.js';
import { deepClone } from './utils.js';

/**
 * Game类：管理游戏状态 + undo/redo
 */
export class Game {
    #currentSudoku;
	#initialSudoku;
    #undoStack = [];
    #redoStack = [];

    /**
     * @param {Sudoku} sudoku
     */
    constructor(sudoku) {
        if (!(sudoku instanceof Sudoku)) {
            throw new Error('Invalid Sudoku instance');
        }
        this.#currentSudoku = sudoku.clone();
		this.#initialSudoku = sudoku.clone();
    }

    /** 获取当前数独 */
    getSudoku() {
        return this.#currentSudoku.clone();
    }
	
	getInitialSudoku() {
        return this.#initialSudoku.clone();
    }

    /**
     * 执行一步操作，保证题目所给数字无法被用户操作
     * @param {{row:number, col:number, value:number}} move
     */
    guess(move) {
		const {row, col, value}  = move;
		const initialgrid=this.#initialSudoku.getGrid()
		if (initialgrid[row][col] !== 0) return ;
		
        this.#undoStack.push(this.#currentSudoku.clone());
        this.#currentSudoku.guess(move);
        this.#redoStack = [];
    }

    /** 撤销 */
    undo() {
        if (!this.canUndo()) return;

        this.#redoStack.push(this.#currentSudoku.clone());
        this.#currentSudoku = this.#undoStack.pop();
    }

    /** 重做 */
    redo() {
        if (!this.canRedo()) return;

        this.#undoStack.push(this.#currentSudoku.clone());
        this.#currentSudoku = this.#redoStack.pop();
    }

    canUndo() {
        return this.#undoStack.length > 0;
    }

    canRedo() {
        return this.#redoStack.length > 0;
    }
	
	newGame(initialGrid) {
    // 创建一个新的 Sudoku 实例
    this.#currentSudoku = new Sudoku(initialGrid || Array.from({ length: 9 }, () => Array(9).fill(0)));
	this.#initialSudoku = new Sudoku(initialGrid || Array.from({ length: 9 }, () => Array(9).fill(0)));
  	}
	
	

    /** 序列化 */
    toJSON() {
        return {
            sudoku: this.#currentSudoku.toJSON(),
            undoStack: this.#undoStack.map(s => s.toJSON()),
            redoStack: this.#redoStack.map(s => s.toJSON())
        };
    }

    /** 反序列化 */
    static fromJSON(json) {
        if (!json || !json.sudoku) {
            throw new Error('Invalid JSON for Game');
        }

        const sudoku = Sudoku.fromJSON(json.sudoku);
        const game = new Game(sudoku);

        game.#undoStack = (json.undoStack || []).map(Sudoku.fromJSON);
        game.#redoStack = (json.redoStack || []).map(Sudoku.fromJSON);

        return game;
    }
}

export function createGame({ sudoku }) {
    return new Game(sudoku);
}

export function createGameFromJSON(json) {
    return Game.fromJSON(json);
}