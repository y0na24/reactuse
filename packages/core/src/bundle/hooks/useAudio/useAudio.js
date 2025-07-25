import { useEffect, useRef, useState } from 'react';
/**
 * @name useAudio
 * @description - Hook that manages audio playback with sprite support
 * @category Browser
 *
 * @browserapi Audio https://developer.mozilla.org/en-US/docs/Web/API/Audio
 *
 * @template Value The type of the value
 * @param {string} url The URL of the audio file to play
 * @param {UseAudioOptions} [options] Audio configuration options
 * @param {number} [options.volume=1] Initial volume level (0 to 1)
 * @param {number} [options.playbackRate=1] Initial playback speed (0.5 to 2)
 * @param {boolean} [options.interrupt=false] Whether to stop current playback when starting a new one
 * @param {boolean} [options.soundEnabled=true] Whether audio playback is initially enabled
 * @param {SpriteMap} [options.sprite] Map of named audio segments for sprite-based playback
 * @returns {UseAudioReturn} An object containing audio controls and state
 *
 * @example
 * const audio = useAudio("/path/to/sound.mp3");
 */
export const useAudio = (src, options = {}) => {
  const [playing, setPlaying] = useState(false);
  const [volume, setCurrentVolume] = useState(options.volume ?? 1);
  const [playbackRate, setPlaybackRate] = useState(options.playbackRate ?? 1);
  const audioRef = useRef(null);
  useEffect(() => {
    const audio = new Audio(src);
    audio.volume = volume;
    audio.playbackRate = playbackRate;
    audioRef.current = audio;
    if (options.immediately) audio.play();
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => setPlaying(false);
    const onTimeUpdate = () => {};
    const onVolumeChange = () => setCurrentVolume(audio.volume);
    const onRateChange = () => setPlaybackRate(audio.playbackRate);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('volumechange', onVolumeChange);
    audio.addEventListener('ratechange', onRateChange);
    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('volumechange', onVolumeChange);
      audio.removeEventListener('ratechange', onRateChange);
      audio.pause();
      audio.remove();
    };
  }, [src]);
  const stop = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
  };
  const play = async (spriteName) => {
    if (!audioRef.current) return;
    if (options.interrupt) stop();
    if (!spriteName || !options.sprite?.[spriteName]) {
      await audioRef.current.play();
      return;
    }
    const [start, end] = options.sprite[spriteName];
    audioRef.current.currentTime = start;
    await audioRef.current.play();
    const checkTime = () => {
      if (!audioRef.current) return;
      if (audioRef.current.currentTime >= end) {
        stop();
      }
      if (!playing) return;
      requestAnimationFrame(checkTime);
    };
    requestAnimationFrame(checkTime);
  };
  const pause = () => audioRef.current?.pause();
  const setVolume = (value) => {
    if (!audioRef.current) return;
    const newVolume = Math.max(0, Math.min(1, value));
    audioRef.current.volume = newVolume;
    setCurrentVolume(newVolume);
  };
  const changePlaybackRate = (value) => {
    if (!audioRef.current) return;
    const newRate = Math.max(0.5, Math.min(2, value));
    audioRef.current.playbackRate = newRate;
    setPlaybackRate(newRate);
  };
  return {
    play,
    pause,
    stop,
    playing,
    setVolume,
    volume,
    changePlaybackRate,
    playbackRate
  };
};
