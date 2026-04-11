import { deepClone } from './utils.js';

/**
 * Sudoku类：负责棋盘状态
 */
export class Sudoku {
    #grid;

    /**
     * @param {number[][]} inputGrid
     */
    constructor(inputGrid) {
        this.#grid = deepClone(inputGrid);
    }

    /** 获取棋盘 */
    getGrid() {
        return deepClone(this.#grid);
    }

    /**
     * 执行一次填写
     * @param {{row:number, col:number, value:number}} move
     */
    guess({ row, col, value }) {
        if (
            row < 0 || row >= this.#grid.length ||
            col < 0 || col >= this.#grid[0].length
        ) {
            throw new Error('Invalid move: out of bounds');
        }

        this.#grid[row][col] = value;
    }

    /** 深拷贝当前 Sudoku */
    clone() {
        return new Sudoku(this.#grid);
    }

    /** 文本输出 */
    toString() {
        return this.#grid.map(row => row.join(' ')).join('\n');
    }

    /** 序列化 */
    toJSON() {
        return {
            grid: deepClone(this.#grid)
        };
    }

    /** 反序列化 */
    static fromJSON(json) {
        if (!json || !Array.isArray(json.grid)) {
            throw new Error('Invalid JSON for Sudoku');
        }
        return new Sudoku(json.grid);
    }
	
	/**
	 * @param {number[][]} sudoku
	 */
	printSudoku(sudoku) {
		let out = '╔═══════╤═══════╤═══════╗\n';
	
		for (let row = 0; row < SUDOKU_SIZE; row++) {
			if (row !== 0 && row % BOX_SIZE === 0) {
				out += '╟───────┼───────┼───────╢\n';
			}
	
			for (let col = 0; col < SUDOKU_SIZE; col++) {
				if (col === 0) {
					out += '║ ';
				} else if (col % BOX_SIZE === 0) {
					out += '│ ';
				}
	
				out += (sudoku[row][col] === 0 ? '·' : sudoku[row][col]) + ' ';
	
				if (col === SUDOKU_SIZE - 1) {
					out += '║';
				}
			}
	
			out += '\n';
		}
	
		out += '╚═══════╧═══════╧═══════╝';
	
		console.log(out);
	}
	
}

export function createSudoku(inputGrid) {
    return new Sudoku(inputGrid);
}

export function createSudokuFromJSON(json) {
    return Sudoku.fromJSON(json);
}