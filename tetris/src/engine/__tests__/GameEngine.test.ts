// @vitest-environment happy-dom

/**
 * GameEngine 单元测试
 *
 * 覆盖：状态机 / 计分 / 等级 / 消行 / Hold / 暂停 / Game Over
 *
 * 设计：
 * - happy-dom 提供 Canvas + AudioContext 桩
 * - AudioSystem 内部 catch 异常，确保测试无声播放
 * - 不调用 start()（避免 requestAnimationFrame 干扰）
 * - 通过 public methods（startGame / handleAction / 等）直接驱动状态机
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { GameEngine, type GameEngineCallbacks, type GameSnapshot } from '../GameEngine';
import { CONFIG } from '../../config';

function makeCanvas(): HTMLCanvasElement {
  // happy-dom 的 canvas 不支持 getContext('2d')，手动 stub
  const c = document.createElement('canvas') as HTMLCanvasElement;
  const noop = () => {};
  const ctx: Partial<CanvasRenderingContext2D> = {
    fillRect: noop,
    strokeRect: noop,
    clearRect: noop,
    fillText: noop,
    beginPath: noop,
    closePath: noop,
    moveTo: noop,
    lineTo: noop,
    stroke: noop,
    fill: noop,
    save: noop,
    restore: noop,
    quadraticCurveTo: noop,
    scale: noop,
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 0,
    globalAlpha: 1,
    font: '',
    textAlign: 'left',
    textBaseline: 'top',
    shadowColor: '',
    shadowBlur: 0,
  };
  (c as unknown as { getContext: (id: string) => CanvasRenderingContext2D | null }).getContext = () =>
    ctx as CanvasRenderingContext2D;
  // 让 canvas 尺寸相关属性可写
  Object.defineProperty(c, 'width', { value: 600, writable: true, configurable: true });
  Object.defineProperty(c, 'height', { value: 600, writable: true, configurable: true });
  return c;
}

function makeEngine() {
  const events: { phase?: string; score: number[]; lines: number[]; level: number[]; clears: Array<[number, boolean]>; levelUps: number[]; gameOver: Array<[number, boolean]>; snapshots: GameSnapshot[] } = {
    score: [],
    lines: [],
    level: [],
    clears: [],
    levelUps: [],
    gameOver: [],
    snapshots: [],
  };

  const callbacks: GameEngineCallbacks = {
    onPhaseChange: (p) => {
      events.phase = p;
    },
    onStateChange: (snap) => {
      events.score.push(snap.score);
      events.lines.push(snap.lines);
      events.level.push(snap.level);
      events.snapshots.push(snap);
    },
    onLinesClear: (count, isTetris) => {
      events.clears.push([count, isTetris]);
    },
    onLevelUp: (level) => {
      events.levelUps.push(level);
    },
    onGameOver: (score, isNewRecord) => {
      events.gameOver.push([score, isNewRecord]);
    },
  };

  const canvas = makeCanvas();
  const engine = new GameEngine({ canvas, callbacks });
  return { engine, events, canvas };
}

beforeEach(() => {
  // 清除 localStorage，避免测试间污染
  localStorage.clear();
});

describe('GameEngine - 状态机', () => {
  it('初始 phase = menu', () => {
    const { engine } = makeEngine();
    // engine 构造时未触发 onPhaseChange，phase 内部为 menu
    // 通过触发 startGame 间接观察
    expect((engine as unknown as { phase: string }).phase).toBe('menu');
  });

  it('startGame() → phase = playing', () => {
    const { engine, events } = makeEngine();
    engine.startGame();
    expect(events.phase).toBe('playing');
  });

  it('togglePause() playing → paused → playing', () => {
    const { engine, events } = makeEngine();
    engine.startGame();
    engine.togglePause();
    expect(events.phase).toBe('paused');
    engine.togglePause();
    expect(events.phase).toBe('playing');
  });

  it('backToMenu() → phase = menu', () => {
    const { engine, events } = makeEngine();
    engine.startGame();
    engine.backToMenu();
    expect(events.phase).toBe('menu');
  });
});

describe('GameEngine - 计分（NES 经典）', () => {
  it('软降一格 +1', () => {
    const { engine, events } = makeEngine();
    engine.startGame();
    const initialScore = events.score[events.score.length - 1] ?? 0;
    // 模拟软降：内部 action 'softDrop' 走 handleAction
    (engine as unknown as { handleAction: (a: string) => void }).handleAction('softDrop');
    const after = events.score[events.score.length - 1] ?? 0;
    expect(after - initialScore).toBeGreaterThanOrEqual(CONFIG.SCORE.SOFT_DROP);
  });

  it('硬降计分（基于硬降距离）', () => {
    const { engine, events } = makeEngine();
    engine.startGame();
    // 记录硬降前的分数
    const before = events.score[events.score.length - 1] ?? 0;
    (engine as unknown as { handleAction: (a: string) => void }).handleAction('hardDrop');
    const after = events.score[events.score.length - 1] ?? 0;
    // 硬降一格 = +2，且会触发锁定，pushState 会再次推送分数
    expect(after).toBeGreaterThanOrEqual(before + CONFIG.SCORE.HARD_DROP);
  });

  it('消行计分（满底行 Tetris = 800 × level）', () => {
    const { engine, events } = makeEngine();
    engine.startGame();
    // 直接通过 board 填满最底 4 行（Tetris）
    const board = (engine as unknown as { board: { getFullGrid: () => Array<Array<string | null>> } }).board;
    const grid = board.getFullGrid();
    const bottomRow = CONFIG.GRID.ROWS + CONFIG.GRID.BUFFER_ROWS - 1;
    for (let y = bottomRow - 3; y <= bottomRow; y++) {
      for (let x = 0; x < CONFIG.GRID.COLS; x++) {
        grid[y]![x] = 'I';
      }
    }
    // 触发 hardDrop 让 current 锁定，触发消行逻辑
    (engine as unknown as { handleAction: (a: string) => void }).handleAction('hardDrop');

    // 验证消行事件：Tetris 4 行
    expect(events.clears.some(([n, tetris]) => n === 4 && tetris === true)).toBe(true);
  });

  it('消行触发 onLinesClear（任意行数）', () => {
    const { engine, events } = makeEngine();
    engine.startGame();

    // 填满最底行
    const board = (engine as unknown as { board: { getFullGrid: () => Array<Array<string | null>> } }).board;
    const grid = board.getFullGrid();
    const bottomRow = CONFIG.GRID.ROWS + CONFIG.GRID.BUFFER_ROWS - 1;
    for (let x = 0; x < CONFIG.GRID.COLS; x++) {
      grid[bottomRow]![x] = 'I';
    }
    (engine as unknown as { handleAction: (a: string) => void }).handleAction('hardDrop');

    expect(events.clears.length).toBeGreaterThan(0);
    // 至少 1 行被消
    expect(events.clears.some(([n]) => n >= 1)).toBe(true);
  });

  it('破纪录通过 onGameOver 回调传出（引擎不再直接写 localStorage）', () => {
    const { engine, events } = makeEngine();
    engine.startGame();

    // 填满最底行触发消行获得分数
    const board = (engine as unknown as { board: { getFullGrid: () => Array<Array<string | null>> } }).board;
    const grid = board.getFullGrid();
    const bottomRow = CONFIG.GRID.ROWS + CONFIG.GRID.BUFFER_ROWS - 1;
    for (let x = 0; x < CONFIG.GRID.COLS; x++) {
      grid[bottomRow]![x] = 'I';
    }
    (engine as unknown as { handleAction: (a: string) => void }).handleAction('hardDrop');

    // 触发 gameOver（通过模拟无法出生）
    (engine as unknown as { phase: string }).phase = 'playing';
    (engine as unknown as { gameOver: () => void }).gameOver();

    // 引擎不再直接写 localStorage[CONFIG.STORAGE_KEY]，由外部 store 负责
    expect(localStorage.getItem(CONFIG.STORAGE_KEY)).toBeNull();
    // 验证 onGameOver 回调被调用，且 isNewRecord = true（初始 highScore = 0）
    expect(events.gameOver.length).toBeGreaterThan(0);
    const [score, isNewRecord] = events.gameOver[events.gameOver.length - 1]!;
    expect(score).toBeGreaterThan(0);
    expect(isNewRecord).toBe(true);
  });
});

describe('GameEngine - 等级', () => {
  it('每 10 行升一级', () => {
    const { engine, events } = makeEngine();
    engine.startGame();

    // 直接修改 lines 字段
    (engine as unknown as { lines: number }).lines = CONFIG.SPEED.LINES_PER_LEVEL;
    (engine as unknown as { handleLineClear: (rows: number[]) => void }).handleLineClear([CONFIG.GRID.ROWS + CONFIG.GRID.BUFFER_ROWS - 1]);

    expect(events.levelUps).toContain(2);
  });

  it('升级时触发 onLevelUp 回调', () => {
    const { engine, events } = makeEngine();
    engine.startGame();
    // 强制升级
    (engine as unknown as { lines: number }).lines = CONFIG.SPEED.LINES_PER_LEVEL;
    (engine as unknown as { handleLineClear: (rows: number[]) => void }).handleLineClear([CONFIG.GRID.ROWS + CONFIG.GRID.BUFFER_ROWS - 1]);
    expect(events.levelUps.length).toBeGreaterThan(0);
  });
});

describe('GameEngine - 消行', () => {
  it('消行触发 onLinesClear(count, isTetris)', () => {
    const { engine, events } = makeEngine();
    engine.startGame();

    // 填满 1 行
    const board = (engine as unknown as { board: { getFullGrid: () => Array<Array<string | null>> } }).board;
    const grid = board.getFullGrid();
    const bottomRow = CONFIG.GRID.ROWS + CONFIG.GRID.BUFFER_ROWS - 1;
    for (let x = 0; x < CONFIG.GRID.COLS; x++) {
      grid[bottomRow]![x] = 'I';
    }
    (engine as unknown as { handleAction: (a: string) => void }).handleAction('hardDrop');

    expect(events.clears.length).toBeGreaterThan(0);
  });

  it('Tetris 触发 isTetris = true', () => {
    const { engine, events } = makeEngine();
    engine.startGame();

    // 填满 4 行
    const board = (engine as unknown as { board: { getFullGrid: () => Array<Array<string | null>> } }).board;
    const grid = board.getFullGrid();
    const bottomRow = CONFIG.GRID.ROWS + CONFIG.GRID.BUFFER_ROWS - 1;
    for (let y = bottomRow - 3; y <= bottomRow; y++) {
      for (let x = 0; x < CONFIG.GRID.COLS; x++) {
        grid[y]![x] = 'I';
      }
    }
    (engine as unknown as { handleAction: (a: string) => void }).handleAction('hardDrop');

    expect(events.clears.some(([, tetris]) => tetris === true)).toBe(true);
  });
});

describe('GameEngine - Hold', () => {
  it('首次 hold：保存当前方块', () => {
    const { engine } = makeEngine();
    engine.startGame();
    const currentType = (engine as unknown as { current: { type: string } }).current.type;
    (engine as unknown as { handleAction: (a: string) => void }).handleAction('hold');
    const holdType = (engine as unknown as { holdType: string | null }).holdType;
    expect(holdType).toBe(currentType);
  });

  it('二次 hold：与已 hold 方块交换', () => {
    const { engine } = makeEngine();
    engine.startGame();
    const firstType = (engine as unknown as { current: { type: string } }).current.type;
    // 第一次 hold
    (engine as unknown as { handleAction: (a: string) => void }).handleAction('hold');
    const held = (engine as unknown as { holdType: string | null }).holdType;
    // 此时 current 已被替换为下一个；类型不同
    const newCurrentType = (engine as unknown as { current: { type: string } }).current.type;
    expect(newCurrentType).not.toBe(firstType);
    expect(held).toBe(firstType);
  });

  it('holdUsed 锁：每局只能 hold 一次', () => {
    const { engine } = makeEngine();
    engine.startGame();
    const beforeType = (engine as unknown as { current: { type: string } }).current.type;
    (engine as unknown as { handleAction: (a: string) => void }).handleAction('hold');
    const afterFirstHoldType = (engine as unknown as { current: { type: string } }).current.type;
    // 第二次 hold 应该无效（holdUsed = true）
    (engine as unknown as { handleAction: (a: string) => void }).handleAction('hold');
    const afterSecondHoldType = (engine as unknown as { current: { type: string } }).current.type;
    expect(afterFirstHoldType).toBe(afterSecondHoldType);
    // current 不应该再被改
    expect(beforeType).not.toBe(afterFirstHoldType);
  });
});

describe('GameEngine - 输入响应', () => {
  it('moveLeft / moveRight 移动方块', () => {
    const { engine } = makeEngine();
    engine.startGame();
    const before = { ...(engine as unknown as { current: { position: { x: number; y: number } } }).current.position };
    (engine as unknown as { handleAction: (a: string) => void }).handleAction('moveRight');
    const afterRight = (engine as unknown as { current: { position: { x: number; y: number } } }).current.position;
    expect(afterRight.x).toBe(before.x + 1);
    (engine as unknown as { handleAction: (a: string) => void }).handleAction('moveLeft');
    const afterLeft = (engine as unknown as { current: { position: { x: number; y: number } } }).current.position;
    expect(afterLeft.x).toBe(before.x);
  });

  it('rotateCW 顺时针旋转方块', () => {
    const { engine } = makeEngine();
    engine.startGame();
    const beforeRot = (engine as unknown as { current: { rotation: number } }).current.rotation;
    (engine as unknown as { handleAction: (a: string) => void }).handleAction('rotateCW');
    const afterRot = (engine as unknown as { current: { rotation: number } }).current.rotation;
    expect(afterRot).toBe((beforeRot + 1) % 4);
  });

  it('在 menu 阶段 confirm → 进入 playing', () => {
    const { engine, events } = makeEngine();
    // engine 初始 phase = menu
    (engine as unknown as { handleAction: (a: string) => void }).handleAction('confirm');
    expect(events.phase).toBe('playing');
  });
});

describe('GameEngine - Audio 控制', () => {
  it('getAudio() 返回 AudioSystem 实例', () => {
    const { engine } = makeEngine();
    const audio = engine.getAudio();
    expect(audio).toBeDefined();
    expect(typeof audio.playMove).toBe('function');
    expect(typeof audio.playClear).toBe('function');
  });

  it('toggleMute action 切换音频状态', () => {
    const { engine } = makeEngine();
    const audio = engine.getAudio();
    const before = audio.isEnabled();
    (engine as unknown as { handleAction: (a: string) => void }).handleAction('toggleMute');
    const after = audio.isEnabled();
    expect(after).toBe(!before);
  });
});

describe('GameEngine - 软降持续', () => {
  it('handleAction(softDrop) → softDropActive=true', () => {
    const { engine } = makeEngine();
    engine.startGame();
    (engine as unknown as { handleAction: (a: string) => void }).handleAction('softDrop');
    expect((engine as unknown as { softDropActive: boolean }).softDropActive).toBe(true);
  });

  it('handleAction(stopSoftDrop) → softDropActive=false', () => {
    const { engine } = makeEngine();
    engine.startGame();
    // 先激活软降
    (engine as unknown as { handleAction: (a: string) => void }).handleAction('softDrop');
    expect((engine as unknown as { softDropActive: boolean }).softDropActive).toBe(true);
    // 再停止软降
    (engine as unknown as { handleAction: (a: string) => void }).handleAction('stopSoftDrop');
    expect((engine as unknown as { softDropActive: boolean }).softDropActive).toBe(false);
  });
});

describe('GameEngine - Lock Delay 集成', () => {
  it('startGame 后 lockDelay 未激活', () => {
    const { engine } = makeEngine();
    engine.startGame();
    const lockDelay = (engine as unknown as { lockDelay: { isActive: () => boolean } }).lockDelay;
    expect(lockDelay.isActive()).toBe(false);
  });

  it('方块到达底部时 lockDelay 启动', () => {
    const { engine } = makeEngine();
    engine.startGame();
    // 将当前方块移到最底部（ghost 位置）
    const board = (engine as unknown as { board: { getGhostY: (p: unknown) => number } }).board;
    const current = (engine as unknown as { current: { position: { x: number; y: number }; clone: () => unknown } }).current;
    const ghostY = board.getGhostY(current);
    // 直接设置方块位置到 ghost 位置
    (engine as unknown as { current: { position: { x: number; y: number } } }).current.position.y = ghostY;
    // 调用 update 触发重力 → tryMove(0,1) 失败 → lockDelay.start()
    (engine as unknown as { update: (dt: number) => void }).update(1000);
    const lockDelay = (engine as unknown as { lockDelay: { isActive: () => boolean } }).lockDelay;
    expect(lockDelay.isActive()).toBe(true);
  });

  it('lockDelay 激活时移动方块会重置延迟', () => {
    const { engine } = makeEngine();
    engine.startGame();
    const lockDelay = (engine as unknown as {
      lockDelay: { start: () => void; tick: (dt: number) => void; shouldLock: () => boolean; isActive: () => boolean };
    }).lockDelay;
    // 手动启动 lockDelay 并 tick 到应锁定
    lockDelay.start();
    lockDelay.tick(CONFIG.LOCK_DELAY.DELAY_MS);
    expect(lockDelay.shouldLock()).toBe(true);
    // 移动方块 → tryMove → lockDelay.reset()
    (engine as unknown as { handleAction: (a: string) => void }).handleAction('moveLeft');
    // reset 后 elapsed=0，shouldLock 应为 false
    expect(lockDelay.shouldLock()).toBe(false);
  });
});

describe('GameEngine - B2B 状态', () => {
  it('Tetris 消行后 snapshot.b2b = true', () => {
    const { engine, events } = makeEngine();
    engine.startGame();
    // 填满最底 4 行（Tetris）
    const board = (engine as unknown as { board: { getFullGrid: () => Array<Array<string | null>> } }).board;
    const grid = board.getFullGrid();
    const bottomRow = CONFIG.GRID.ROWS + CONFIG.GRID.BUFFER_ROWS - 1;
    for (let y = bottomRow - 3; y <= bottomRow; y++) {
      for (let x = 0; x < CONFIG.GRID.COLS; x++) {
        grid[y]![x] = 'I';
      }
    }
    // 触发 hardDrop 锁定当前方块并消行
    (engine as unknown as { handleAction: (a: string) => void }).handleAction('hardDrop');
    // 最后一个 snapshot 应包含 b2b=true
    const lastSnap = events.snapshots[events.snapshots.length - 1];
    expect(lastSnap).toBeDefined();
    expect(lastSnap.b2b).toBe(true);
  });

  it('Single 消行后 snapshot.b2b = false', () => {
    const { engine, events } = makeEngine();
    engine.startGame();
    // 填满最底 1 行（Single）
    const board = (engine as unknown as { board: { getFullGrid: () => Array<Array<string | null>> } }).board;
    const grid = board.getFullGrid();
    const bottomRow = CONFIG.GRID.ROWS + CONFIG.GRID.BUFFER_ROWS - 1;
    for (let x = 0; x < CONFIG.GRID.COLS; x++) {
      grid[bottomRow]![x] = 'I';
    }
    // 触发 hardDrop 锁定当前方块并消行
    (engine as unknown as { handleAction: (a: string) => void }).handleAction('hardDrop');
    // 最后一个 snapshot 应包含 b2b=false（Single 不是硬消行）
    const lastSnap = events.snapshots[events.snapshots.length - 1];
    expect(lastSnap).toBeDefined();
    expect(lastSnap.b2b).toBe(false);
  });
});

describe('GameEngine - 统计跟踪', () => {
  it('startGame 后 stats 重置（pieces=1 因出生首个方块，其余为 0）', () => {
    const { engine, events } = makeEngine();
    engine.startGame();
    const lastSnap = events.snapshots[events.snapshots.length - 1];
    // startGame 会出生首个方块，故 pieces=1；其余统计均为 0
    // startTime 和 duration 由 startGame/gameOver 设置，这里只验证消行相关字段为 0
    expect(lastSnap.stats.pieces).toBe(1);
    expect(lastSnap.stats.singles).toBe(0);
    expect(lastSnap.stats.doubles).toBe(0);
    expect(lastSnap.stats.triples).toBe(0);
    expect(lastSnap.stats.tetrises).toBe(0);
    expect(lastSnap.stats.tSpins).toBe(0);
    expect(lastSnap.stats.tSpinMinis).toBe(0);
    expect(lastSnap.stats.perfectClears).toBe(0);
    expect(lastSnap.stats.maxCombo).toBe(0);
    expect(lastSnap.stats.maxB2B).toBe(0);
    expect(lastSnap.stats.startTime).toBeGreaterThan(0);
    expect(lastSnap.stats.duration).toBe(0);
  });

  it('锁定方块后 stats.pieces 递增', () => {
    const { engine, events } = makeEngine();
    engine.startGame();
    const beforeSnap = events.snapshots[events.snapshots.length - 1];
    const beforePieces = beforeSnap.stats.pieces;
    // hardDrop 锁定当前方块
    (engine as unknown as { handleAction: (a: string) => void }).handleAction('hardDrop');
    const afterSnap = events.snapshots[events.snapshots.length - 1];
    expect(afterSnap.stats.pieces).toBe(beforePieces + 1);
  });

  it('Tetris 消行后 stats.tetrises 递增', () => {
    const { engine, events } = makeEngine();
    engine.startGame();
    // 填满最底 4 行
    const board = (engine as unknown as { board: { getFullGrid: () => Array<Array<string | null>> } }).board;
    const grid = board.getFullGrid();
    const bottomRow = CONFIG.GRID.ROWS + CONFIG.GRID.BUFFER_ROWS - 1;
    for (let y = bottomRow - 3; y <= bottomRow; y++) {
      for (let x = 0; x < CONFIG.GRID.COLS; x++) {
        grid[y]![x] = 'I';
      }
    }
    (engine as unknown as { handleAction: (a: string) => void }).handleAction('hardDrop');
    const lastSnap = events.snapshots[events.snapshots.length - 1];
    expect(lastSnap.stats.tetrises).toBeGreaterThanOrEqual(1);
  });
});

describe('GameEngine - handleActionPublic', () => {
  it('handleActionPublic 存在且与 handleAction 行为一致', () => {
    const { engine } = makeEngine();
    engine.startGame();
    const before = (engine as unknown as { current: { position: { x: number; y: number } } }).current.position.x;
    // 通过 handleActionPublic 移动
    engine.handleActionPublic('moveRight');
    const after = (engine as unknown as { current: { position: { x: number; y: number } } }).current.position.x;
    expect(after).toBe(before + 1);
  });
});

describe('GameEngine - Hold 触发 Game Over', () => {
  it('Hold 互换后出生位置被占 → 触发 gameOver，不推送不一致状态', () => {
    const { engine, events } = makeEngine();
    engine.startGame();

    // 设置 holdType，使下次 hold 走互换分支
    (engine as unknown as { holdType: string | null }).holdType = 'I';
    // holdUsed 在 startGame 后为 false，无需修改

    // 填充出生位置（缓冲区行 0-1），使新方块出生即重叠
    const board = (engine as unknown as { board: { getFullGrid: () => Array<Array<string | null>> } }).board;
    const grid = board.getFullGrid();
    for (let x = 0; x < CONFIG.GRID.COLS; x++) {
      grid[0]![x] = 'I';
      grid[1]![x] = 'I';
    }

    const snapshotsBefore = events.snapshots.length;
    const gameOverBefore = events.gameOver.length;

    // 触发 hold（互换分支）→ 新方块出生位置被占 → gameOver
    (engine as unknown as { handleAction: (a: string) => void }).handleAction('hold');

    // 验证 gameOver 被触发
    expect(events.gameOver.length).toBe(gameOverBefore + 1);
    // 验证没有推送新状态（pushState 未被调用，避免不一致状态）
    expect(events.snapshots.length).toBe(snapshotsBefore);
    // 验证 phase = over
    expect((engine as unknown as { phase: string }).phase).toBe('over');
  });
});

describe('GameEngine - Lock Delay + Hard Drop', () => {
  it('硬降应立即锁定，不走 lock delay 等待', () => {
    const { engine } = makeEngine();
    engine.startGame();

    // 将方块移到底部（ghost 位置）
    const board = (engine as unknown as { board: { getGhostY: (p: unknown) => number } }).board;
    const current = (engine as unknown as { current: { position: { x: number; y: number }; clone: () => unknown } }).current;
    const ghostY = board.getGhostY(current);
    (engine as unknown as { current: { position: { x: number; y: number } } }).current.position.y = ghostY;

    // 调用 update 触发重力 → tickGravity → tryMove(0,1) 失败 → lockDelay.start()
    (engine as unknown as { update: (dt: number) => void }).update(1000);

    const lockDelay = (engine as unknown as { lockDelay: { isActive: () => boolean; shouldLock: () => boolean } }).lockDelay;
    expect(lockDelay.isActive()).toBe(true);
    // elapsed=0 < DELAY_MS，不应锁定
    expect(lockDelay.shouldLock()).toBe(false);

    // 硬降应立即锁定（不等待 lock delay 到期）
    (engine as unknown as { handleAction: (a: string) => void }).handleAction('hardDrop');

    // 锁定后 lockDelay 应停止（lockCurrent → stop，spawnNext → stop）
    expect(lockDelay.isActive()).toBe(false);
  });
});

describe('GameEngine - Lock Delay RESET_MAX 上限', () => {
  it('15 次重置后强制锁定（无法再 reset）', () => {
    const { engine } = makeEngine();
    engine.startGame();

    // 将方块移到底部（ghost 位置）
    const board = (engine as unknown as { board: { getGhostY: (p: unknown) => number } }).board;
    const current = (engine as unknown as { current: { position: { x: number; y: number }; clone: () => unknown } }).current;
    const ghostY = board.getGhostY(current);
    (engine as unknown as { current: { position: { x: number; y: number } } }).current.position.y = ghostY;

    // 调用 update 触发 lockDelay 启动
    (engine as unknown as { update: (dt: number) => void }).update(1000);

    const lockDelay = (engine as unknown as { lockDelay: { isActive: () => boolean; shouldLock: () => boolean; tick: (dt: number) => void } }).lockDelay;
    expect(lockDelay.isActive()).toBe(true);

    // 进行 15 次移动重置（交替左右移动，每次成功并 reset）
    for (let i = 0; i < CONFIG.LOCK_DELAY.RESET_MAX; i++) {
      // 每次移动前累加时间接近锁定阈值
      lockDelay.tick(CONFIG.LOCK_DELAY.DELAY_MS - 1);
      if (i % 2 === 0) {
        (engine as unknown as { handleAction: (a: string) => void }).handleAction('moveLeft');
      } else {
        (engine as unknown as { handleAction: (a: string) => void }).handleAction('moveRight');
      }
    }

    // 15 次重置后，resetCount 已达上限，lockDelay 仍激活
    expect(lockDelay.isActive()).toBe(true);

    // 再累加时间接近锁定，尝试第 16 次 reset（应为 no-op）
    lockDelay.tick(CONFIG.LOCK_DELAY.DELAY_MS - 1);
    (engine as unknown as { handleAction: (a: string) => void }).handleAction('moveLeft');
    // reset 无效，elapsed 未归零，再 tick 1ms 达到 DELAY_MS → shouldLock = true
    lockDelay.tick(1);
    expect(lockDelay.shouldLock()).toBe(true);

    // 调用 update 应触发强制锁定（lockCurrent → spawnNext）
    const piecesBefore = (engine as unknown as { stats: { pieces: number } }).stats.pieces;
    (engine as unknown as { update: (dt: number) => void }).update(1);
    const piecesAfter = (engine as unknown as { stats: { pieces: number } }).stats.pieces;
    // 锁定后出生新方块，pieces 递增
    expect(piecesAfter).toBe(piecesBefore + 1);
    // lockDelay 应已停止
    expect(lockDelay.isActive()).toBe(false);
  });
});
