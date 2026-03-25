// 职场斗兽棋 - 游戏逻辑

import { initBoard, canEat, canCrossRiver, RANKS } from './constants';

/**
 * 游戏核心类
 */
export class Game {
  constructor() {
    this.board = initBoard();
    this.currentPlayer = 'red';
    this.selectedCell = null;
    this.gameOver = false;
    this.winner = null;
    this.redAlive = 8;
    this.blueAlive = 8;
  }

  /**
   * 获取指定位置的格子
   * @param {number} x - 横坐标
   * @param {number} y - 纵坐标
   * @returns {Object|null} 格子对象或null
   */
  getCell(x, y) {
    if (x < 0 || x >= 8 || y < 0 || y >= 8) return null;
    return this.board[y][x];
  }

  /**
   * 检查是否可以移动
   * @param {number} fromX - 起始横坐标
   * @param {number} fromY - 起始纵坐标
   * @param {number} toX - 目标横坐标
   * @param {number} toY - 目标纵坐标
   * @returns {boolean} 是否可以移动
   */
  canMove(fromX, fromY, toX, toY) {
    const from = this.getCell(fromX, fromY);
    const to = this.getCell(toX, toY);

    // 游戏结束了不能动
    if (this.gameOver) return false;

    // 不是自己的棋子不能动
    if (!from || from.type !== 'piece' || from.color !== this.currentPlayer) {
      return false;
    }

    // 不能走到自己已经有棋子的地方
    if (to && to.type === 'piece' && to.color === this.currentPlayer) {
      return false;
    }

    // 检查过河规则：只有经理及以上才能跨部门
    if (to && to.type === 'river') {
      return canCrossRiver(from.rank);
    }

    // 检查距离：只能走一步
    const dx = Math.abs(toX - fromX);
    const dy = Math.abs(toY - fromY);
    if (!((dx === 1 && dy === 0) || (dx === 0 && dy === 1))) {
      return false;
    }

    return true;
  }

  /**
   * 移动棋子
   * @param {number} fromX - 起始横坐标
   * @param {number} fromY - 起始纵坐标
   * @param {number} toX - 目标横坐标
   * @param {number} toY - 目标纵坐标
   * @returns {Object} 移动结果
   */
  movePiece(fromX, fromY, toX, toY) {
    const from = this.getCell(fromX, fromY);
    const to = this.getCell(toX, toY);
    const result = {
      success: false,
      message: '',
      atePiece: false,
      gameOver: false,
      winner: null
    };

    // 检查目标位置是否有效
    if (!to) {
      result.message = '位置无效';
      return result;
    }

    // 检查陷阱：任何棋子进陷阱都被吃
    if (to.type === 'trap') {
      if (to.color !== from.color) {
        // 成功吃掉
        if (from.color === 'red') {
          this.redAlive--;
        } else {
          this.blueAlive--;
        }
        this.board[fromY][fromX] = null;
        
        // 检查游戏结束
        const gameOver = this.checkGameOver();
        
        // 换回合
        this.switchPlayer();
        
        result.success = true;
        result.atePiece = true;
        result.gameOver = gameOver;
        result.winner = this.winner;
        return result;
      }
    }

    // 检查大本营：对方进入己方大本营会被吃掉
    if (to.type === 'headquarter') {
      if (to.color !== from.color) {
        // 成功吃掉
        if (from.color === 'red') {
          this.redAlive--;
        } else {
          this.blueAlive--;
        }
        this.board[fromY][fromX] = null;
        
        // 检查游戏结束
        const gameOver = this.checkGameOver();
        
        // 换回合
        this.switchPlayer();
        
        result.success = true;
        result.atePiece = true;
        result.gameOver = gameOver;
        result.winner = this.winner;
        return result;
      }
    }

    // 处理吃子
    if (to.type === 'piece') {
      if (!canEat(from.rank, to.rank)) {
        // 不能吃
        result.message = '不能这么走哦';
        return result;
      } else {
        // 成功吃掉
        if (to.color === 'red') {
          this.redAlive--;
        } else {
          this.blueAlive--;
        }
        result.atePiece = true;
      }

      // 检查游戏结束
      const gameOver = this.checkGameOver();
      result.gameOver = gameOver;
      result.winner = this.winner;
    }

    // 移动
    this.board[toY][toX] = { ...from };
    this.board[fromY][fromX] = null;

    // 换回合
    this.switchPlayer();

    result.success = true;
    return result;
  }

  /**
   * 检查游戏结束
   * @returns {boolean} 是否游戏结束
   */
  checkGameOver() {
    // 一方杀光了
    if (this.redAlive === 0) {
      this.gameOver = true;
      this.winner = 'blue';
      return true;
    }
    if (this.blueAlive === 0) {
      this.gameOver = true;
      this.winner = 'red';
      return true;
    }

    // 检查还有没有可移动棋子，简化：只要还有活的就能动
    return false;
  }

  /**
   * 切换玩家
   */
  switchPlayer() {
    this.currentPlayer = this.currentPlayer === 'red' ? 'blue' : 'red';
    this.selectedCell = null;
  }
}

/**
 * 初始化游戏
 * @returns {Game} 游戏实例
 */
export function initGame() {
  return new Game();
}

/**
 * 获取吃掉台词
 * @param {string} attackerId - 攻击者ID
 * @param {string} defenderId - 防御者ID
 * @returns {string} 吃掉台词
 */
export function getEatQuote(attackerId, defenderId) {
  const attacker = RANKS.find(r => r.id === attackerId);
  const defender = RANKS.find(r => r.id === defenderId);

  // 特殊台词
  if (attackerId === 'intern' && defenderId === 'ceo') {
    return "没想到吧！新人上位，CEO优化了😎";
  }
  if (attackerId === 'investor' && defenderId) {
    return "故事讲得不错，这轮我投了，你下课💸";
  }
  if (attackerId !== 'intern' && defenderId === 'investor') {
    return "我拒绝融资，公司我说了算✊";
  }

  if (attacker && defender && attacker.quote) {
    return `${attacker.name}吃掉了${defender.name}：${attacker.quote}`;
  }

  return `${attacker?.name || '棋子'}吃掉了${defender?.name || '棋子'}`;
}

/**
 * 获得胜利台词
 * @param {string} winner - 胜利者
 * @returns {string} 胜利台词
 */
export function getWinQuote(winner) {
  return winner === 'red' ? '红方团队胜利！职场就是这么残酷😎' : '蓝方团队胜利！这波操作稳了💪';
}

/**
 * 获取指定位置的格子（静态方法）
 * @param {Array} board - 棋盘
 * @param {number} x - 横坐标
 * @param {number} y - 纵坐标
 * @returns {Object|null} 格子对象或null
 */
export function getCell(board, x, y) {
  if (x < 0 || x >= 8 || y < 0 || y >= 8) return null;
  return board[y][x];
}
