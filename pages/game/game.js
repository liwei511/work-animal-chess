import { RANKS } from '../../utils/constants';
import { initGame, getCell, getEatQuote, getWinQuote } from '../../utils/game';
import { AudioPlayer } from '../../utils/audio';

const audioPlayer = new AudioPlayer();

Page({
  data: {
    game: null,
    selected: {
      x: -1,
      y: -1
    },
    lastEatText: '',
    currentPlayer: 'red',
    isMusicPlaying: true,
    gameStatus: 'playing' // playing, paused, gameOver
  },

  onLoad() {
    const game = getApp().globalData.currentGame;
    this.setData({
      game,
      currentPlayer: game.currentPlayer,
      gameStatus: 'playing'
    });
    audioPlayer.play({
      id: 'game-bg',
      path: '/audio/game-bg.mp3'
    }, true);
    audioPlayer.setVolume(0.3);
    
    // 显示游戏开始提示
    wx.showToast({
      title: '游戏开始！红方先行',
      icon: 'none',
      duration: 2000
    });
  },

  onUnload() {
    audioPlayer.stop();
  },

  onHide() {
    audioPlayer.pause();
    this.setData({ gameStatus: 'paused' });
  },

  onShow() {
    if (this.data.isMusicPlaying) {
      audioPlayer.resume();
    }
    if (this.data.gameStatus === 'paused' && !this.data.game.gameOver) {
      this.setData({ gameStatus: 'playing' });
      wx.showToast({
        title: '游戏继续',
        icon: 'none',
        duration: 1000
      });
    }
  },

  // 暂停游戏
  pauseGame() {
    this.setData({ gameStatus: 'paused' });
    audioPlayer.pause();
    wx.showToast({
      title: '游戏暂停',
      icon: 'none',
      duration: 1000
    });
  },

  // 继续游戏
  resumeGame() {
    this.setData({ gameStatus: 'playing' });
    if (this.data.isMusicPlaying) {
      audioPlayer.resume();
    }
    wx.showToast({
      title: '游戏继续',
      icon: 'none',
      duration: 1000
    });
  },

  // 获取rank显示
  getRankEmoji(rankId) {
    const rank = RANKS.find(r => r.id === rankId);
    if (rank) {
      // 优先显示emoji，如果emoji无法显示则显示文字
      return rank.emoji || rank.name.substring(0, 2);
    }
    return '❓';
  },

  clickCell(e) {
    const { x, y } = e.currentTarget.dataset;
    const game = this.data.game;
    const cell = getCell(game.board, x, y);

    // 如果已经选了一个，现在尝试移动
    if (this.data.selected.x >= 0 && !game.gameOver) {
      const fromX = this.data.selected.x;
      const fromY = this.data.selected.y;

      if (game.canMove(fromX, fromY, x, y)) {
        const result = game.movePiece(fromX, fromY, x, y);
        if (result.success) {
          // 吃了棋子，播报
          if (cell && cell.type === 'piece') {
            const fromCell = getCell(game.board, fromX, fromY);
            const quote = getEatQuote(fromCell.rank, cell.rank);
            this.setData({
              lastEatText: quote
            });
            // 播放吃子音效
            this.playSound('eat');
          } else {
            this.setData({
              lastEatText: ''
            });
            // 播放移动音效
            this.playSound('move');
          }

          // 添加移动动画效果
          this.animateMove(fromX, fromY, x, y);

          this.setData({
            game,
            currentPlayer: game.currentPlayer,
            selected: { x: -1, y: -1 }
          });

          if (game.gameOver) {
            this.setData({
              winnerName: this.getWinnerName(game.winner),
              winnerQuote: getWinQuote(game.winner)
            });
            // 播放胜利音效
            this.playSound('win');
          }
        } else {
          wx.showToast({
            title: result.message || '不能这么走哦',
            icon: 'none',
            duration: 1000
          });
          // 播放错误音效
          this.playSound('error');
        }
      } else {
        // 重新选
        if (cell && cell.type === 'piece' && cell.color === game.currentPlayer) {
          this.setData({
            selected: { x, y }
          });
        } else if (cell && cell.type !== 'piece') {
          wx.showToast({
            title: '请选你自己的棋子',
            icon: 'none',
            duration: 1000
          });
        }
      }
    } else {
      // 第一次选
      if (cell && cell.type === 'piece' && cell.color === game.currentPlayer) {
        this.setData({
          selected: { x, y }
        });
        // 播放选择音效
        this.playSound('select');
      } else {
        wx.showToast({
          title: '请选你自己的棋子',
          icon: 'none',
          duration: 1000
        });
      }
    }
  },

  // 播放音效
  playSound(type) {
    // 这里可以添加音效播放逻辑
    // 由于小程序的音频限制，暂时只做占位
    console.log(`播放${type}音效`);
  },

  // 动画效果
  animateMove(fromX, fromY, toX, toY) {
    // 这里可以添加移动动画逻辑
    // 由于小程序的动画API限制，暂时只做占位
    console.log(`从(${fromX},${fromY})移动到(${toX},${toY})`);
  },

  getWinnerName(color) {
    return color === 'red' ? '红方' : '蓝方';
  },

  restartGame() {
    const game = initGame();
    getApp().globalData.currentGame = game;
    this.setData({
      game,
      selected: { x: -1, y: -1 },
      lastEatText: '',
      currentPlayer: game.currentPlayer
    });
  },

  backToHome() {
    wx.navigateBack();
  },

  toggleMusic() {
    if (this.data.isMusicPlaying) {
      audioPlayer.pause();
      this.setData({ isMusicPlaying: false });
    } else {
      audioPlayer.resume();
      this.setData({ isMusicPlaying: true });
    }
  }
});
