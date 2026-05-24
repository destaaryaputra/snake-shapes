export class SoundManager {
    #audioContext;
    #audioSources;
    #exclusiveSounds;
    #sounds;
    #playingSounds;
    #unlocked;
    #muted;

    constructor() {
        try {
            // Audio dipakai setelah ada klik dari user.
            this.#audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.error("Web Audio API is not supported in this browser.");
            this.#audioContext = null;
        }

        // Daftar nama sound dan file-nya.
        this.#audioSources = {
            start: 'src/assets/sounds/start.mp3',
            benar: 'src/assets/sounds/benar.mp3',
            salah: 'src/assets/sounds/salahmakan.mp3',
            gameover: 'src/assets/sounds/gameover.mp3',
            crash: 'src/assets/sounds/nabrakdinding.mp3',
            nabrakbadan: 'src/assets/sounds/nabrakbadan.mp3'
        };

        // Beberapa sound tidak boleh tabrakan.
        this.#exclusiveSounds = ['gameover', 'crash', 'start', 'nabrakbadan'];

        this.#sounds = {};
        this.#playingSounds = new Set();
        this.#unlocked = false;
        this.#muted = false;
    }
    
    async unlock() {
        // Buka audio cukup sekali.
        if (this.#unlocked || !this.#audioContext) return;
    
        if (this.#audioContext.state === 'suspended') {
            try {
                await this.#audioContext.resume();
            } catch (e) {
                console.error("AudioContext resume failed.", e);
                return;
            }
        }
    
        if (this.#unlocked) return;
        this.#unlocked = true;
    
        this.#initializeSounds();
    }

    async play(type) {
        // Pastikan audio siap sebelum diputar.
        await this.unlock();

        const audio = this.#sounds[type];
        if (!audio) return;

        if (this.#exclusiveSounds.includes(type)) {
            // Hentikan semua sound lain.
            this.stopAll();
        }

        try {
            audio.currentTime = 0;
            audio.muted = this.#muted;
            await audio.play();
            this.#playingSounds.add(type);
        } catch (err) {
            console.error(`Gagal memutar suara: ${type}`, err);
        }
    }

    stop(type) {
        // Hentikan satu sound.
        const audio = this.#sounds[type];
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
            this.#playingSounds.delete(type);
        }
    }

    stopAll() {
        // Hentikan semua sound.
        this.#playingSounds.forEach(soundType => {
            this.stop(soundType);
        });
        this.#playingSounds.clear();
    }

    setMuted(muted) {
        // Samakan status mute ke semua sound.
        this.#muted = Boolean(muted);
        Object.values(this.#sounds).forEach(audio => {
            if (audio) audio.muted = muted;
        });
    }

    toggleMute() {
        // Tombol untuk mute atau unmute.
        this.setMuted(!this.#muted);
        return this.#muted;
    }

    isPlaying(type) {
        // Cek apakah sound sedang jalan.
        return this.#playingSounds.has(type);
    }

    #initializeSounds() {
        // Siapkan semua file suara.
        Object.entries(this.#audioSources).forEach(([key, src]) => {
            const audio = new Audio(src);
            audio.volume = 0.7;
            audio.addEventListener('ended', () => this.#playingSounds.delete(key));
            audio.addEventListener('pause', () => this.#playingSounds.delete(key));
            this.#sounds[key] = audio;
        });
    }
}
