// 职场斗兽棋 - 游戏逻辑

const { initBoard, canEat, canCrossRiver } = require('./constants');

// 初始化游戏
export function initGame() {
  const board = initBoard();
  return {
    board,
    currentPlayer: 'red',
    selectedCell: null,
    gameOver: false,
    winner: null,
    redAlive: 8,
    blueAlive: 8
  };
}

// 获取格子
export function getCell(board, x, y) {
  if (x < 0 || x >= 8 || y < 0 || y >= 8) return null;
  return board[y][x];
}

// 检查能不能移动
export function canMove(game, fromX, fromY, toX, toY) {
  const from = getCell(game.board, fromX, fromY);
  const to = getCell(game.board, toX, toY);

  // 游戏结束了不能动
  if (game.gameOver) return false;

  // 不是自己的棋子不能动
  if (!from || !from.type === 'piece' || from.color !== game.currentPlayer) {
    return false;
  }

  // 不能走到自己已经有棋子的地方
  if (to && to.type === 'piece' && to.color === game.currentPlayer) {
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

// 移动棋子
export function movePiece(game, fromX, fromY, toX, toY) {
  const from = getCell(game.board, fromX, fromY);
  const to = getCell(game.board, toX, toY);

  // 处理吃子
  if (to && to.type === 'piece') {
    // 检查陷阱：任何棋子进陷阱都被吃
    if (to.type === 'trap' && to.color !== from.color) {
      // 吃掉了
      from = null;
      if (to.color === 'red') {
        game.redAlive--;
      } else {
        game.blueAlive--;
      }
    } else if (!canEat(from.rank, to.rank)) {
      // 不能吃
      return false;
    } else {
      // 成功吃掉
      if (to.color === 'red') {
        game.redAlive--;
      } else {
        game.blueAlive--;
      }
    }

    // 检查游戏结束
    checkGameOver(game);
  }

  // 移动
  game.board[toY][toX] = { ...from };
  game.board[fromY][fromX] = null;

  // 换回合
  game.currentPlayer = game.currentPlayer === 'red' ? 'blue' : 'red';
  game.selectedCell = null;

  return true;
}

// 检查游戏结束
export function checkGameOver(game) {
  // 一方杀光了
  if (game.redAlive === 0) {
    game.gameOver = true;
    game.winner = 'blue';
    return true;
  }
  if (game.blueAlive === 0) {
    game.gameOver = true;
    game.winner = 'red';
    return true;
  }

  // 检查还有没有可移动棋子，简化：只要还有活的就能动
  return false;
}

// 获取吃掉台词
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

  if (attacker.quote && defender.quote) {
    return `${attacker.name}吃掉了${defender.name}：${attacker.quote}`;
  }

  return `${attacker.name}吃掉了${defender.name}`;
}

// 获得胜利台词
export function getWinQuote(winner, loser) {
  const winnerRank = RANKS.find(r => r.id === winner);
  return `${winnerRank.name}团队胜利！${winnerRank.quote}`;
}
