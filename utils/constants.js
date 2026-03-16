// 职场斗兽棋 - 常量定义

// 职位等级定义
export const RANKS = [
  {
    id: 'intern',
    name: '实习生',
    rank: 1,
    emoji: '🐣',
    canEat: ['ceo'], // 实习生吃CEO，传统老鼠吃大象
    description: '初生牛犊不怕虎',
    quote: '光脚的不怕穿鞋的，今天我就要把老板取代'
  },
  {
    id: 'specialist',
    name: '专员',
    rank: 3,
    emoji: '🐱',
    canEat: ['intern'],
    description: '专业执行',
    quote: '需求我改了，bug我修了'
  },
  {
    id: 'senior',
    name: '高级专员',
    rank: 4,
    emoji: '🐺',
    canEat: ['intern', 'specialist'],
    description: '资深打工人',
    quote: '我摸我的鱼，你卷你的'
  },
  {
    id: 'manager',
    name: '经理',
    rank: 5,
    emoji: '🐶',
    canEat: ['intern', 'specialist', 'senior'],
    description: '部门经理',
    quote: '这个需求大家加油干'
  },
  {
    id: 'director',
    name: '总监',
    rank: 6,
    emoji: '🐯',
    canEat: ['intern', 'specialist', 'senior', 'manager'],
    description: '部门总监',
    quote: '需求变了，我们改改'
  },
  {
    id: 'cto',
    name: 'CTO/CPO',
    rank: 7,
    emoji: '🦁',
    canEat: ['intern', 'specialist', 'senior', 'manager', 'director'],
    description: '技术/产品负责人',
    quote: '方向我定，兄弟们冲'
  },
  {
    id: 'ceo',
    name: 'CEO',
    rank: 8,
    emoji: '🐘',
    canEat: ['intern', 'specialist', 'senior', 'manager', 'director', 'cto'],
    description: '首席执行官',
    quote: '兄弟们，下个月上市'
  },
  {
    id: 'investor',
    name: '投资人',
    rank: 9,
    emoji: '🦘', // 袋鼠，跳进来投一下
    canEat: ['*'], // 投资人可以吃所有人
    description: '资本大佬',
    quote: '故事讲的好，钱就是我的'
  }
];

// 地形类型
export const TILE_TYPES = {
  plain: {
    id: 'plain',
    name: '平地',
    color: '#e8f5e9',
    canEnter: true
  },
  trap: {
    id: 'trap',
    name: '需求池',
    description: '需求变更陷阱，任何棋子进来都会被吃掉',
    color: '#ffccbc',
    canEnter: true
  },
  river: {
    id: river',
    name: '跨部门沟',
    description: '跨部门沟通河，只有经理及以上才能走',
    color: '#81d4fa',
    canEnter: false
  },
  headquarter: {
    id: 'headquarter',
    name: '工位',
    description: '对方工位，进来就吃掉',
    color: '#ef9a9a',
    canEnter: true
  }
};

// 获取rank定义
export function getRankById(id) {
  return RANKS.find(r => r.id === id);
}

// 检查能不能吃
export function canEat(attackerId, defenderId) {
  const attacker = getRankById(attackerId);
  const defender = getRankById(defenderId);

  // 投资人什么都能吃
  if (attackerId === 'investor') {
    return true;
  }

  // 实习生吃CEO
  if (attackerId === 'intern' && defenderId === 'ceo') {
    return true;
  }

  // 常规大小吃
  return attacker.rank >= defender.rank;
}

// 检查能不能过河（跨部门）
export function canCrossRiver(rankId) {
  const rank = getRankById(rankId);
  // 经理及以上才能跨部门沟通
  return rank.rank >= 5;
}

// 初始化棋盘
export function initBoard() {
  const board = Array(8).fill().map(() => Array(8).fill(null));
  
  // 红方（左边）
  // 对应传统斗兽棋位置
  const redPositions = [
    { x: 0, y: 0, rank: 'ceo', color: 'red' },
    { x: 0, y: 2, rank: 'investor', color: 'red' },
    { x: 0, y: 4, rank: 'cto', color: 'red' },
    { x: 0, y: 6, rank: 'director', color: 'red' },
    { x: 1, y: 1, rank: 'manager', color: 'red' },
    { x: 1, y: 3, rank: 'senior', color: 'red' },
    { x: 1, y: 5, rank: 'specialist', color: 'red' },
    { x: 1, y: 7, rank: 'intern', color: 'red' },
  };

  // 蓝方（右边）
  const bluePositions = [
    { x: 7, y: 7, rank: 'ceo', color: 'blue' },
    { x: 7, y: 5, rank: 'investor', color: 'blue' },
    { x: 7, y: 3, rank: 'cto', color: 'blue' },
    { x: 7, y: 1, rank: 'director', color: 'blue' },
    { x: 6, y: 6, rank: 'manager', color: 'blue' },
    { x: 6, y: 4, rank: 'senior', color: 'blue' },
    { x: 6, y: 2, rank: 'specialist', color: 'blue' },
    { x: 6, y: 0, rank: 'intern', color: 'blue' },
  };

  // 设置地形：四条河在中间
  for (let y = 0; y < 8; y++) {
    if (y === 3 || y === 4) {
      for (let x = 1; x < 7; x++) {
        board[y][x] = { type: 'river' };
      }
    }
  }

  // 陷阱：每个家门口放一个陷阱
  board[0][1] = { type: 'trap', color: 'red' };
  board[7][6] = { type: 'trap', color: 'blue' };

  // 大本营
  board[0][0] = { type: 'headquarter', color: 'red' };
  board[7][7] = { type: 'headquarter', color: 'blue' };

  // 放棋子
  [...redPositions, ...bluePositions].forEach(pos => {
    board[pos.y][pos.x] = {
      type: 'piece',
      rank: pos.rank,
      color: pos.color,
      alive: true
    };
  });

  return board;
}
