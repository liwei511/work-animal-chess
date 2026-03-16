// 职场斗兽棋 - 背景音乐

export const BACKGROUND_MUSIC = {
  'game-bg': {
    id: 'game-bg',
    name: '对局',
    path: '/audio/game-bg.mp3'
  }
};

export class AudioPlayer {
  constructor() {
    this.audioContext = null;
    this.currentMusicId = null;
    this.playing = false;
    this.volume = 0.3;
  }

  play(music, loop = true) {
    if (this.currentMusicId === music.id && this.playing) {
      return;
    }

    this.stop();

    const audio = wx.createInnerAudioContext();
    audio.src = music.path;
    audio.loop = loop;
    audio.volume = this.volume;
    audio.play();

    this.audioContext = audio;
    this.currentMusicId = music.id;
    this.playing = true;
  }

  stop() {
    if (this.audioContext) {
      this.audioContext.stop();
      this.audioContext.destroy();
      this.audioContext = null;
    }
    this.playing = false;
    this.currentMusicId = null;
  }

  pause() {
    if (this.audioContext && this.playing) {
      this.audioContext.pause();
      this.playing = false;
    }
  }

  resume() {
    if (this.audioContext && !this.playing) {
      this.audioContext.play();
      this.playing = true;
    }
  }

  setVolume(v) {
    this.volume = v;
    if (this.audioContext) {
      this.audioContext.volume = v;
    }
  }
}
