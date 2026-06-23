/**
 * Tetromino - 方块实体类
 *
 * 职责：
 * - 持有方块的类型、位置、旋转状态
 * - 提供移动、旋转（带 SRS 踢墙）的纯计算方法
 * - 实际碰撞检测由 Board 完成
 *
 * 设计：
 * - 不可变 API：所有变换返回新 Tetromino 或由调用方更新 position/rotation
 * - 旋转尝试：返回 [newRotation, offsetX, offsetY] 候选列表
 */

import { type Point, type Rotation, type TetrominoType } from '../config';
import { getShape, getRotations } from './tetrominoes';
import { getKicksCW, getKicksCCW, type KickOffset } from './srs';

export class Tetromino {
  public type: TetrominoType;
  public position: Point;
  public rotation: Rotation;

  constructor(type: TetrominoType, position?: Point, rotation: Rotation = 0) {
    this.type = type;
    this.rotation = rotation;
    // 出生位置：水平居中（列 = (10 - 4) / 2 = 3），顶部 y = 0（缓冲区）
    this.position = position ?? { x: 3, y: 0 };
  }

  /**
   * 获取当前形状（4×4 矩阵）
   */
  shape(): number[][] {
    return getShape(this.type, this.rotation);
  }

  /**
   * 获取所有 4 个旋转状态
   */
  rotations(): number[][][] {
    return getRotations(this.type);
  }

  /**
   * 浅拷贝（用于尝试变换而不修改原对象）
   */
  clone(): Tetromino {
    return new Tetromino(this.type, { ...this.position }, this.rotation);
  }

  /**
   * 顺时针旋转的尝试偏移列表（含 [0, 0]）
   * 返回的偏移是相对于当前位置的增量
   * 调用方依次尝试，第一个合法即采用
   */
  rotationAttemptsCW(): { rotation: Rotation; offset: KickOffset }[] {
    const nextRotation = ((this.rotation + 1) % 4) as Rotation;
    const kicks = getKicksCW(this.type === 'I' ? 'I' : 'JLSTZ', this.rotation);
    return kicks.map((offset) => ({ rotation: nextRotation, offset }));
  }

  /**
   * 逆时针旋转的尝试偏移列表
   */
  rotationAttemptsCCW(): { rotation: Rotation; offset: KickOffset }[] {
    const nextRotation = ((this.rotation + 3) % 4) as Rotation;
    const kicks = getKicksCCW(this.type === 'I' ? 'I' : 'JLSTZ', this.rotation);
    return kicks.map((offset) => ({ rotation: nextRotation, offset }));
  }

  /**
   * 180° 旋转（不需要踢墙）
   */
  rotation180(): Rotation {
    return ((this.rotation + 2) % 4) as Rotation;
  }

  /**
   * 应用旋转结果（直接修改 position 和 rotation）
   */
  applyRotation(rotation: Rotation, offset: KickOffset): void {
    this.rotation = rotation;
    this.position = {
      x: this.position.x + offset[0],
      y: this.position.y + offset[1],
    };
  }

  /**
   * 移动（直接修改）
   */
  move(dx: number, dy: number): void {
    this.position = {
      x: this.position.x + dx,
      y: this.position.y + dy,
    };
  }

  /**
   * 设置位置（直接修改）
   */
  setPosition(x: number, y: number): void {
    this.position = { x, y };
  }

  /**
   * 获取所有实心格子的全局坐标（用于碰撞检测/锁定）
   * 返回 {x, y} 数组
   */
  cells(): Point[] {
    const shape = this.shape();
    const result: Point[] = [];
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r]!.length; c++) {
        if (shape[r]![c] === 1) {
          result.push({
            x: this.position.x + c,
            y: this.position.y + r,
          });
        }
      }
    }
    return result;
  }
}
