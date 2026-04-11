### 你的 Sudoku / Game 的职责边界是什么？
1. Sudoku的职责边界
   
	维护 9x9 的数独表格 `grid`\
	提供最基本的修改表格数据操作 `guess`

2. Game的职责边界

	负责游戏生命周期的维护\
	维护 `Sudoku` 对象并协调修改操作
	维护撤销栈和重做栈，实现撤销 `undo` 与恢复 `undo` 操作

### Move 是值对象还是实体对象？为什么？

值对象

不需要修改，直接作为值使用\
对于数值相同的 `Move` ，直接视为同一个对象即可，不需要分配唯一的 ID

### history 中存储的是什么？为什么？

存储的是 `Sudoku` 对象的深拷贝实例

实现简单，需要撤销或恢复时，从栈中取出快照并覆盖即可，不需要进行变换操作

### 你的复制策略是什么？哪些地方需要深拷贝？

显式克隆策略

在构造函数、执行撤销恢复操作、序列化时使用深拷贝

### 你的序列化 / 反序列化设计是什么？

序列化：在每个类中都实现了 `toJSON()` 方法
- `Sudoku.toJSON()` 返回包含 `grid` 的普通对象
- `Game.toJSON()` 调用 `Sudoku` 的序列化方法，生成包含当前棋盘、撤销栈和重做栈的对象。

反序列化：
- 通过 `createSudokuFromJSON` 和 `createGameFromJSON` 函数，将 `JSON` 数据重新实例化成对象，加载游戏和棋盘

### 你的外表化接口是什么？为什么这样设计？

接口：
- `createGame` 创建游戏
- `createSudoku` 创建棋盘
- `game.guess(), game.undo(), game.redo()` 对游戏状态的操作
- `game.toJSON()` 数据导出

设计原因：
- 封装，防止类内部的对象被外部访问
- 易操作，只需要输入动作或者指令，即可按照逻辑将游戏状态进行修改




### A. 领域对象如何被消费

#### A.1 View 层直接消费的对象

View 层不直接使用领域对象（Game / Sudoku），而是通过`gameStore`进行访问。

#### A.2 View 层获取的数据

View 层通过 `gameStore`，获得一个 `ViewState` 对象：

{\
  grid,           // 当前棋盘（9x9 二维数组）\
  invalidCells,   // 冲突格子集合\
  won,            // 是否完成游戏\
  history         // 撤回与恢复操作\
}

设计原则：

View 层只处理展示数据
不直接访问领域对象内部结构

#### A.3 用户操作如何进入领域对象

A.3.1 数字输入（guess）

用户在 UI 中触发输入操作：

gameStore.guess(x, y, value)

调用链如下：

UI (click)
 → gameStore.guess(...)
 → Game.guess(...)
 → Sudoku.guess(...)
 → 更新领域状态
 
A.3.2 Undo / Redo

用户操作：

gameStore.undo()\
gameStore.redo()

调用链：

UI
 → gameStore.undo()
 → Game.undo()
 → 切换历史记录中的 Sudoku 状态
 
#### A.4 为什么领域对象变化后 UI 会更新？

关键机制：

UI 更新依赖 store.set()，而不是领域对象本身的变化

在 gameStore 中：

set(createViewState(game))

执行流程：

领域对象变化
 → createViewState(...)
 → store.set(...)
 → Svelte 触发订阅更新
 → UI 重新渲染

结论：

Svelte 只监听 store\
不监听类内部状态变化

### B. 响应式机制说明
#### B.1 使用的响应式机制

本项目主要依赖：

Svelte writable store\
store.set() 触发更新\
\$: 作为核心状态管理手段

#### B.2 响应式暴露给 UI 的数据

通过 gameStore 暴露：

grid\
invalidCells\
won\
history

这些数据具有以下特点：

扁平结构\
可序列化\
适合 UI 渲染

#### B.3 保留在领域对象内部的状态

以下状态仅存在于领域层：

Game:
  - history
  - Sudoku

Sudoku:
  - grid

特点：

不直接暴露给 UI\
不具备响应式能力\
由 store 统一转换

#### B.4 如果直接 mutate 内部对象的问题

示例：

game.sudoku.board[x][y] = value

会导致：

（1）UI 不更新

原因：

store 未调用 set()\
Svelte 无法检测深层变化

（2）Undo / Redo 失效

原因：

mutation 会破坏历史快照\
导致状态不可回溯

（3）数据与 UI 不一致

表现：

数据已修改\
页面未更新

结论：

必须通过 store.set() 触发更新，避免直接 mutation

### C. 改进说明
#### C.1 相比 HW1 的改进

（1）引入领域对象

HW1：\
直接操作二维数组

当前：\
使用 Game + Sudoku 封装逻辑

优势：\
逻辑集中
易测试
易扩展

（2）引入 Store / Adapter 层

HW1：\
UI 直接操作数据

当前：\
UI → store → domain

优势：\
解耦 UI 与业务逻辑
响应式边界清晰

（3）支持 Undo / Redo

通过：\
history
currentIndex

实现状态回溯

#### C.2 HW1 的不足
（1）缺乏分层

UI 与逻辑耦合严重

（2）响应式不可控

mutation 难以追踪\
容易出现 UI 不更新问题

（3）扩展性差

难以支持：\
历史记录\
状态持久化

#### C.3 新设计的 Trade-offs

优点

清晰的分层结构\
响应式行为可控\
易于扩展和测试

缺点

（1）复杂度增加

需要额外引入：\
Domain 层\
Store 层

（2）性能开销

每次更新需要：\
createViewState(game)\
可能带来一定开销

### D

#### D.1 你的方案依赖了 Svelte 的什么机制

- Svelte store（writable）\
显式触发 UI 更新

- $store 自动订阅\
自动响应 store 更新
#### D.2 你的 UI 为什么会更新

UI 更新是由 set() 驱动，而不是对象内部变化

### Conclusion

本项目通过引入 Store 作为领域对象与 UI 的桥梁，将领域状态转换为响应式 ViewState，并通过 store.set() 驱动 UI 更新，实现了：

正确的响应式机制\
清晰的分层结构\
良好的可维护性与扩展性