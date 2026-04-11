<script>
	import { onMount } from 'svelte';
	import { validateSencode } from '@sudoku/sencode';
	import { modal } from '@sudoku/stores/modal';

	import Board from './components/Board/index.svelte';
	import Controls from './components/Controls/index.svelte';
	import Header from './components/Header/index.svelte';
	import Modal from './components/Modal/index.svelte';

	// 你的领域对象
	import { createGame } from './domain/game.js';
	import { createSudoku } from './domain/sudoku.js';

	// store（用官方的）
	import { gameStore } from '@sudoku/stores/createGameStore';

	// ✅ 初始化 Sudoku
	const initialGrid = Array.from({ length: 9 }, () => Array(9).fill(0));
	const sudoku = createSudoku(initialGrid);

	// ✅ 创建 store
	// const gameStore = createGameStore({ sudoku });

	// // ✅ ⚡ 关键：初始化游戏（否则棋盘是空的）
	// gameStore.newGame();

	// 监听胜利
	gameStore.subscribe(state => {
		if (state.won) {
			gameStore.pause();
			modal.show('gameover');
		}
	});

	const demoGrid = [
  [5,3,0,0,7,0,0,0,0],
  [6,2,0,1,9,5,0,0,0],
  [0,9,8,0,0,0,0,6,0],
  [8,0,0,0,6,0,0,0,3],
  [4,0,0,8,0,3,0,0,1],
  [7,0,0,0,2,0,0,0,6],
  [0,6,0,0,0,0,2,8,0],
  [0,0,0,4,1,9,0,0,5],
  [0,0,0,0,8,0,0,7,9]
];
	
	onMount(() => {
		
		// console.log("run onMount")
		
		gameStore.newGame(demoGrid);   // ⭐ 关键
		
		let hash = location.hash;
		if (hash.startsWith('#')) hash = hash.slice(1);

		let sencode;
		if (validateSencode(hash)) sencode = hash;

		modal.show('welcome', { onHide: gameStore.resume, sencode });
	});
</script>

<!-- Header -->
<header>
	<Header />
</header>

<!-- Sudoku Board -->
<section>
	<!-- ✅ 把 gameStore 传进去 -->
	<Board {gameStore} />
</section>

<!-- Controls -->
<footer>
	<!-- ✅ 同样传进去 -->
	<Controls {gameStore} />
</footer>

<Modal />

<style global>
	@import "./styles/global.css";
</style>