## HW 问题收集

列举在HW 1、HW1.1过程里，你所遇到的2\~3个通过自己学习已经解决的问题，和2\~3个尚未解决的问题与挑战

### 已解决

1. 为什么 `Game` 中要存 `initialSudoku` 和 `currentSudoku` 两个棋盘
   1. **上下文**：要求给定的数字不能修改，`guess` 须先判断填写的格子是否为只读的
   2. **解决手段**：理解 `guess` 函数和数独游戏的规则，在测试中发现bug并修改
2. `undo` 和 `redo` 为什么要调用 `clone()`
   1. **上下文**：`Game` 类的 `redo` 和 `undo` 都需要克隆 `Sudoku` 对象
   2. **解决手段**：查询资料与AI，需要在栈中保存独立的快照才能保证其不被修改

### 未解决

1. 为什么 `newGame` 要重新创建 `Sudoku` 而不是直接修改 `grid`

   1. **上下文**：`Game` 类每次调用 `newGame` 都重新 `new Sudoku()`，而不直接覆盖数组

   2. **尝试解决手段**：问CA未果

2. `isConflict` 与 `getInvalidCells` 逻辑高度相似，为什么要写两份？

   1. **上下文**：`Game` 里的 `isConflict` 和 `Sudoku` 里的 `getInvalidCells` 都在做重复检查。
   2. **尝试解决手段**：不知道合并之后会不会出现bug