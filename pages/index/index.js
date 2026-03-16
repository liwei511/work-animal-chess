const { initGame } = require('../../utils/game');

Page({
  startGame() {
    getApp().globalData.currentGame = initGame();
    wx.navigateTo({
      url: '/pages/game/game'
    });
  }
});
