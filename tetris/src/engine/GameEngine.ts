/**
 * GameEngine - 游戏主循环 + 状态机
 *
 * 阶段机：
 *   menu ──confirm──▶ playing ──pause──▶ paused ──pause──▶ playing
 *                          │
 *                          └─触顶──▶ over ──confirm──▶ playing
 *
 * 设计要点：
 * - 60Hz 固定时间步长主循环
 * - 不依赖 React（除 canvas）
 * - 内部状态私有，避免高频更新 store
 * - 通过 callbacks 通知外部状态变化
 *
 * 事件驱动：
 * - 状态变化（phase）→ onPhaseChange
 * - 计分/等级/Hold/Next 等事件 → onStateChange（推送完整 snapshot）
 * - 消行 → onLinesClear（含消除行数 / 是否 Tetris）
 * - 等级提升 → onLevelUp
 * - 死亡 → onGameOver
 */

import {
  CONFIG,
  type GamePhase,
  type Grid,
  type TetrominoType,
} from '../config';
import { Board } from './Board';
import { Tetromino } from './Tetromino';
import { Bag } from './Bag';
import { Renderer } from './Renderer';
import { Input, type Action } from './Input';
import { AudioSystem } from '../lib/audio';
import { storage } from '../lib/storage';

export interface GameSnapshot {
  grid: Grid; // 显示网格（不含缓冲区）
  current: {
    type: TetrominoType;
    rotation: number;
    x: number;
    y: number;
  } | null;
  ghostY: number;
  holdType: TetrominoType | null;
  nextQueue: TetrominoType[];
  score: number;
  highScore: number;
  level: number;
  lines: number;
  combo: number;
  isNewRecord: boolean;
}

export interface GameEngineCallbacks {
  onPhaseChange: (phase: GamePhase) => void;
  onStateChange: (snapshot: GameSnapshot) => void;
  onLinesClear: (count: number, isTetris: boolean) => void;
  onLevelUp: (level: number) => void;
  onGameOver: (finalScore: number, isNewRecord: boolean) => void;
}

export interface GameEngineOptions {
  canvas: HTMLCanvasElement;
  callbacks: GameEngineCallbacks;
}

export class GameEngine {
  // ============ 状态 ============
  private phase: GamePhase = 'menu';
  private rafId = 0;
  private lastTime = 0;
  private accumulator = 0;
  private gravityAccumulator = 0;

  /** 固定逻辑更新间隔（毫秒） */
  private readonly LOGIC_STEP = 1000 / 60;

  // ============ 游戏数据 ============
  private board: Board;
  private bag: Bag;
  private current: Tetromino | null = null;
  private nextQueue: TetrominoType[] = [];
  private holdType: TetrominoType | null = null;
  private holdUsed = false; // 锁键：每局只能换 1 次

  // ============ 计分 ============
  private score = 0;
  private highScore = 0;
  private level = 1;
  private lines = 0;
  private combo = -1; // -1 表示无连击；0 表示第 1 次消行

  // ============ 子系统 ============
  private renderer: Renderer;
  private input: Input;
  private audio: AudioSystem;
  private callbacks: GameEngineCallbacks;

  // ============ 软降状态 ============
  private softDropActive = false;

  constructor(options: GameEngineOptions) {
    const { canvas, callbacks } = options;
    this.callbacks = callbacks;

    this.highScore = storage.get<number>(CONFIG.STORAGE_KEY, 0);

    this.board = new Board();
    this.bag = new Bag();
    this.renderer = new Renderer(canvas);
    this.input = new Input();
    this.audio = new AudioSystem();

    // 预填 Next 队列（比 NEXT_COUNT 多 1，current 出生时取走 1 个）
    this.nextQueue = this.bag.take(CONFIG.NEXT_COUNT + 1);

    // 绑定输入
    this.input.bind({ onAction: (action) => this.handleAction(action) }, canvas);
  }

  // ============ 生命周期 ============

  public start(): void {
    this.audio.resume();
    this.lastTime = performance.now();
    this.rafId = requestAnimationFrame((t) => this.loop(t));
  }

  public stop(): void {
    cancelAnimationFrame(this.rafId);
    this.input.unbind();
  }

  // ============ 主循环 ============

  private loop(timestamp: number): void {
    const delta = timestamp - this.lastTime;
    this.lastTime = timestamp;

    const clampedDelta = Math.min(delta, 100);
    this.accumulator += clampedDelta;

    while (this.accumulator >= this.LOGIC_STEP) {
      this.update(this.LOGIC_STEP);
      this.accumulator -= this.LOGIC_STEP;
    }

    this.render();
    this.rafId = requestAnimationFrame((t) => this.loop(t));
  }

  /** 逻辑更新 */
  private update(_dt: number): void {
    if (this.phase !== 'playing') return;

    // 计算当前等级的下落间隔
    const dropInterval = this.getDropInterval();

    // 处理软降（按下时按 1/10 速度下落）
    const effectiveInterval = this.softDropActive ? dropInterval / 10 : dropInterval;

    this.gravityAccumulator += _dt;
    while (this.gravityAccumulator >= effectiveInterval) {
      this.gravityAccumulator -= effectiveInterval;
      this.tickGravity();
    }
  }

  /** 渲染 */
  private render(): void {
    const ghostY = this.current ? this.board.getGhostY(this.current) : 0;
    this.renderer.render({
      grid: this.board.getFullGrid(),
      current: this.current,
      ghostY,
      holdType: this.holdType,
      nextQueue: this.nextQueue.slice(0, CONFIG.NEXT_COUNT),
      score: this.score,
      level: this.level,
      lines: this.lines,
    });
  }

  // ============ 核心逻辑 ============

  /** 重力下落一格 */
  private tickGravity(): void {
    if (!this.current) return;
    const moved = this.tryMove(this.current, 0, 1);
    if (!moved) {
      this.lockCurrent();
    }
  }

  /** 尝试移动方块，成功返回 true */
  private tryMove(piece: Tetromino, dx: number, dy: number): boolean {
    const moved = piece.clone();
    moved.move(dx, dy);
    if (this.board.isValidPosition(moved)) {
      piece.move(dx, dy);
      return true;
    }
    return false;
  }

  /** 锁定当前方块 */
  private lockCurrent(): void {
    if (!this.current) return;
    this.board.lockPiece(this.current);
    this.audio.playLock();

    // 检查消行
    const fullLines = this.board.findFullLines();
    if (fullLines.length > 0) {
      this.handleLineClear(fullLines);
    } else {
      this.combo = -1; // 重置连击
    }

    // 出生新方块
    this.spawnNext();

    // 推送状态
    this.pushState();
  }

  /** 处理消行 */
  private handleLineClear(rows: number[]): void {
    const count = rows.length;
    this.combo++;

    // 计分
    const baseScore = [0, CONFIG.SCORE.SINGLE, CONFIG.SCORE.DOUBLE, CONFIG.SCORE.TRIPLE, CONFIG.SCORE.TETRIS][count]!;
    let lineScore = baseScore * this.level;
    if (this.combo > 0) {
      lineScore += CONFIG.SCORE.COMBO_BONUS * this.combo;
    }
    this.score += lineScore;
    this.lines += count;

    // 等级提升（每 10 行）
    const newLevel = Math.floor(this.lines / CONFIG.SPEED.LINES_PER_LEVEL) + 1;
    if (newLevel > this.level) {
      this.level = newLevel;
      this.callbacks.onLevelUp(this.level);
      this.audio.playLevelUp();
    }

    // 动画
    this.renderer.setClearAnimation(rows, count >= 4);
    this.audio.playClear(count);

    // 通知 UI
    this.callbacks.onLinesClear(count, count >= 4);

    // 实际消行
    this.board.clearLines(rows);
  }

  /** 出生新方块 */
  private spawnNext(): void {
    const type = this.nextQueue.shift();
    if (!type) {
      this.gameOver();
      return;
    }
    // 补足 Next 队列
    while (this.nextQueue.length < CONFIG.NEXT_COUNT + 1) {
      this.nextQueue.push(...this.bag.take(CONFIG.NEXT_COUNT + 1 - this.nextQueue.length));
    }

    this.current = new Tetromino(type, { x: 3, y: 0 });
    this.holdUsed = false; // 新方块出生，解锁 Hold

    // Game Over 判定
    if (this.board.isGameOver(this.current)) {
      this.gameOver();
    }
  }

  /** 游戏结束 */
  private gameOver(): void {
    if (this.phase !== 'playing') return;
    this.audio.playGameOver();
    this.setPhase('over');

    // 破纪录
    const isNewRecord = this.score > this.highScore;
    if (isNewRecord) {
      this.highScore = this.score;
      storage.set(CONFIG.STORAGE_KEY, this.highScore);
    }

    this.callbacks.onGameOver(this.score, isNewRecord);
  }

  // ============ 公开动作 ============

  public startGame(): void {
    this.board.reset();
    this.bag.reset();
    this.nextQueue = this.bag.take(CONFIG.NEXT_COUNT + 1);
    this.score = 0;
    this.level = 1;
    this.lines = 0;
    this.combo = -1;
    this.holdType = null;
    this.holdUsed = false;
    this.gravityAccumulator = 0;
    this.renderer.clearAnimations();
    this.spawnNext();
    this.setPhase('playing');
    this.audio.playClick();
    this.pushState();
  }

  public togglePause(): void {
    if (this.phase === 'playing') {
      this.setPhase('paused');
      this.audio.playClick();
    } else if (this.phase === 'paused') {
      this.setPhase('playing');
      this.audio.playClick();
    }
  }

  public backToMenu(): void {
    this.current = null;
    this.setPhase('menu');
    this.pushState();
  }

  public getAudio(): AudioSystem {
    return this.audio;
  }

  // ============ 输入处理 ============

  private handleAction(action: Action): void {
    if (action === 'toggleMute') {
      const enabled = this.audio.toggle();
      console.info(enabled ? '🔊 音效已开启' : '🔇 音效已关闭');
      return;
    }

    if (this.phase === 'menu' || this.phase === 'over') {
      if (action === 'confirm' || action === 'reset') {
        this.startGame();
      }
      return;
    }

    if (this.phase === 'paused') {
      if (action === 'pause') {
        this.togglePause();
      } else if (action === 'reset') {
        this.startGame();
      }
      return;
    }

    // playing 状态
    if (!this.current) return;

    switch (action) {
      case 'moveLeft':
        if (this.tryMove(this.current, -1, 0)) {
          this.audio.playMove();
          this.pushState();
        }
        break;
      case 'moveRight':
        if (this.tryMove(this.current, 1, 0)) {
          this.audio.playMove();
          this.pushState();
        }
        break;
      case 'softDrop':
        this.softDropActive = true;
        if (this.tryMove(this.current, 0, 1)) {
          this.score += CONFIG.SCORE.SOFT_DROP;
          this.pushState();
        }
        // 软降按住期间不需要持续触发
        this.softDropActive = false;
        break;
      case 'hardDrop':
        this.hardDrop();
        break;
      case 'rotateCW':
        this.tryRotate(true);
        break;
      case 'rotateCCW':
        this.tryRotate(false);
        break;
      case 'rotate180':
        this.tryRotate180();
        break;
      case 'hold':
        this.tryHold();
        break;
      case 'pause':
        this.togglePause();
        break;
      case 'reset':
        this.startGame();
        break;
    }
  }

  private hardDrop(): void {
    if (!this.current) return;
    const distance = this.board.getHardDropDistance(this.current);
    this.current.position = { x: this.current.position.x, y: this.current.position.y + distance };
    this.score += distance * CONFIG.SCORE.HARD_DROP;
    this.audio.playDrop();
    this.lockCurrent();
  }

  private tryRotate(clockwise: boolean): void {
    if (!this.current) return;
    const attempts = clockwise
      ? this.current.rotationAttemptsCW()
      : this.current.rotationAttemptsCCW();
    for (const { rotation, offset } of attempts) {
      const test = this.current.clone();
      test.applyRotation(rotation, offset);
      if (this.board.isValidPosition(test)) {
        this.current.applyRotation(rotation, offset);
        this.audio.playRotate();
        this.pushState();
        return;
      }
    }
  }

  private tryRotate180(): void {
    if (!this.current) return;
    const test = this.current.clone();
    test.rotation = this.current.rotation180();
    if (this.board.isValidPosition(test)) {
      this.current.rotation = test.rotation;
      this.audio.playRotate();
      this.pushState();
    }
  }

  private tryHold(): void {
    if (!this.current || this.holdUsed) return;
    this.audio.playHold();

    const currentType = this.current.type;
    if (this.holdType) {
      // 互换
      this.current = new Tetromino(this.holdType, { x: 3, y: 0 });
    } else {
      // 从 Next 队列取下一个
      this.spawnNext();
      this.holdType = currentType;
      this.holdUsed = true; // 锁定：避免 spawnNext 重置后被再次 hold
      return;
    }
    this.holdType = currentType;
    this.holdUsed = true;

    if (this.board.isGameOver(this.current)) {
      this.gameOver();
    }
    this.pushState();
  }

  // ============ 工具方法 ============

  /** 当前等级的下落间隔（ms） */
  private getDropInterval(): number {
    // 等级 1 = 1000ms，等级 20+ = ~16ms
    // 公式：max(MIN_MS, INITIAL_MS * ACCEL^(level-1))
    const interval = CONFIG.SPEED.INITIAL_MS * Math.pow(CONFIG.SPEED.ACCEL, this.level - 1);
    return Math.max(CONFIG.SPEED.MIN_MS, interval);
  }

  private setPhase(p: GamePhase): void {
    this.phase = p;
    this.callbacks.onPhaseChange(p);
  }

  private buildSnapshot(): GameSnapshot {
    return {
      grid: this.board.getDisplayGrid(),
      current: this.current
        ? {
            type: this.current.type,
            rotation: this.current.rotation,
            x: this.current.position.x,
            y: this.current.position.y,
          }
        : null,
      ghostY: this.current ? this.board.getGhostY(this.current) : 0,
      holdType: this.holdType,
      nextQueue: this.nextQueue.slice(0, CONFIG.NEXT_COUNT),
      score: this.score,
      highScore: this.highScore,
      level: this.level,
      lines: this.lines,
      combo: Math.max(0, this.combo),
      isNewRecord: this.score > 0 && this.score >= this.highScore,
    };
  }

  private pushState(): void {
    this.callbacks.onStateChange(this.buildSnapshot());
  }

  /** 软降结束（keyup 事件，外部调用） */
  public endSoftDrop(): void {
    this.softDropActive = false;
  }
}
