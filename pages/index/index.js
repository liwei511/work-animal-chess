import { initGame } from '../../utils/game';

Page({
  startGame() {
    getApp().globalData.currentGame = initGame();
    wx.navigateTo({
      url: '/pages/game/game'
    });
  }
});
