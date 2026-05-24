export class SoundManager {
    constructor() {
        this.audioSources = {
            start: 'assets/sounds/start.mp3',
            benar: 'assets/sounds/benar.mp3',
            salah: 'assets/sounds/salahmakan.mp3',
            gameover: 'assets/sounds/gameover.mp3',
            crash: 'assets/sounds/nabrakdinding.mp3'
        };

        this.exclusiveSounds = ['gameover', 'crash', 'start'];

        this.sounds = {};
        this.playingSounds = new Set(); 
        this.unlocked = false;
        this.muted = false;

        // Pre-load sounds
        this._initSounds();
    }

    _initSounds() {
        Object.entries(this.audioSources).forEach(([key, src]) => {
            const audio = new Audio(src);
            audio.preload = 'auto';
            audio.volume = 0.7;

            audio.addEventListener('ended', () => {
                this.playingSounds.delete(key);
            });

            audio.addEventListener('pause', () => {
                this.playingSounds.delete(key);
            });

            this.sounds[key] = audio;
        });
    }

    unlock() {
        if (this.unlocked) return;
        
        // Play and immediately pause all sounds to unlock them
        Object.values(this.sounds).forEach(audio => {
            audio.play().then(() => {
                audio.pause();
                audio.currentTime = 0;
            }).catch(() => {
                // Ignore errors, user might not have interacted yet
            });
        });

        this.unlocked = true;
    }

    play(type) {
        const audio = this.sounds[type];
        if (!audio) return;

        if (this.exclusiveSounds.includes(type)) {
            if (this.playingSounds.has(type)) {
                this.stop(type);
            }
        }

        audio.currentTime = 0;
        audio.muted = this.muted;

        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                this.playingSounds.add(type);
            }).catch(e => {
                console.warn(`Playback failed for ${type}:`, e);
            });
        }
    }

    stop(type) {
        const audio = this.sounds[type];
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
            this.playingSounds.delete(type);
        }
    }

    stopAll() {
        this.playingSounds.forEach(soundType => {
            this.stop(soundType);
        });
        this.playingSounds.clear();
    }

    setMuted(muted) {
        this.muted = muted;
        Object.values(this.sounds).forEach(audio => {
            if (audio) audio.muted = muted;
        });
    }

    toggleMute() {
        this.setMuted(!this.muted);
        return this.muted;
    }

    isPlaying(type) {
        return this.playingSounds.has(type);
    }
}
