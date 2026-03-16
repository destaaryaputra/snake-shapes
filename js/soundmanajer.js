export class SoundManager {
    constructor() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.error("Web Audio API is not supported in this browser.");
            this.audioContext = null;
        }

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
    }

    unlock() {
        if (this.unlocked) return;
        this.unlocked = true;

        Object.entries(this.audioSources).forEach(([key, src]) => {
            const audio = new Audio(src);
            audio.volume = 0.7;

            audio.addEventListener('ended', () => {
                this.playingSounds.delete(key);
            });

            audio.addEventListener('pause', () => {
                this.playingSounds.delete(key);
            });

            this.sounds[key] = audio;
        });

        const first = this.sounds.start;
        if (first) {
            first.muted = true;
            first.play().catch(() => {}).finally(() => {
                first.pause();
                first.currentTime = 0;
                first.muted = false;
            });
        }
    }

    play(type) {
        this.unlock();

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
            }).catch(() => {
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
