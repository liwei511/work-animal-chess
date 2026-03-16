const { RANKS, canMove, movePiece, getEatQuote, getWinQuote } = require('../../utils/constants');
const { initGame, getCell } = require('../../utils/game');
const { AudioPlayer } = require('../../utils/audio');

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
    isMusicPlaying: true
  },

  onLoad() {
    const game = getApp().globalData.currentGame;
    this.setData({
      game,
      currentPlayer: game.currentPlayer
    });
    audioPlayer.play({
      id: 'game-bg',
      path: '/audio/game-bg.mp3'
    }, true);
    audioPlayer.setVolume(0.3);
  },

  onUnload() {
    audioPlayer.stop();
  },

  onHide() {
    audioPlayer.pause();
  },

  onShow() {
    if (this.data.isMusicPlaying) {
      audioPlayer.resume();
    }
  },

  // 获取rank emoji
  getRankEmoji(rankId) {
    const rank = RANKS.find(r => r.id === rankId);
    return rank ? rank.emoji : '❓';
  },

  clickCell(e) {
    const { x, y } = e.currentTarget.dataset;
    const game = this.data.game;
    const cell = getCell(game.board, x, y);

    // 如果已经选了一个，现在尝试移动
    if (this.data.selected.x >= 0 && !game.gameOver) {
      const fromX = this.data.selected.x;
      const fromY = this.data.selected.y;

      if (canMove(game, fromX, fromY, x, y)) {
        const moved = movePiece(game, fromX, fromY, x, y);
        if (moved) {
          // 吃了棋子，播报
          const fromCell = getCell(game.board, fromX, fromY);
          if (cell && cell.type === 'piece') {
            const quote = getEatQuote(fromCell.rank, cell.rank);
            this.setData({
              lastEatText: quote
            });
          } else {
            this.setData({
              lastEatText: ''
            });
          }

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
          }
        } else {
          wx.showToast({
            title: '不能这么走哦',
            icon: 'none'
          });
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
            icon: 'none'
          });
        }
      }
    } else {
      // 第一次选
      if (cell && cell.type === 'piece' && cell.color === game.currentPlayer) {
        this.setData({
          selected: { x, y }
        });
      } else {
        wx.showToast({
          title: '请选你自己的棋子',
          icon: 'none'
        });
      }
    }
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
