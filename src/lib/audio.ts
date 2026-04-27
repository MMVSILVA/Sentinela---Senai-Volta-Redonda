const SIREN_URL = 'https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg';

class AudioManager {
  private siren: HTMLAudioElement | null = null;
  private isPreloaded = false;

  preload() {
    if (this.isPreloaded) return;
    try {
      this.siren = new Audio(SIREN_URL);
      this.siren.preload = 'auto';
      this.siren.loop = true;
      this.isPreloaded = true;
      console.log("Audio alert preloaded and ready.");
    } catch (err) {
      console.error("Audio preload failed:", err);
    }
  }

  play() {
    if (!this.siren) this.preload();
    if (this.siren) {
      this.siren.currentTime = 0;
      this.siren.play().catch(e => console.log("Audio interaction required:", e));
    }
  }

  stop() {
    if (this.siren) {
      this.siren.pause();
      this.siren.currentTime = 0;
    }
  }
}

export const audioManager = new AudioManager();
