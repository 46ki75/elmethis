import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { clsx } from "clsx";
import {
  mdiFastForward10,
  mdiMusicNote,
  mdiPause,
  mdiPlay,
  mdiRewind10,
  mdiVolumeHigh,
  mdiVolumeLow,
  mdiVolumeMedium,
  mdiVolumeOff,
} from "@mdi/js";

import styles from "./elm-audio-player.module.css";
import { ElmMdiIcon } from "../icon/elm-mdi-icon";

export interface ElmAudioPlayerProps extends Omit<
  ComponentPropsWithoutRef<"div">,
  "title"
> {
  /**
   * Audio source URL.
   */
  src: string;

  /**
   * Track title shown in the header. Falls back to the file name in `src`.
   */
  title?: string;

  /**
   * Secondary line under the title (artist, album, podcast name, …).
   */
  artist?: string;

  /**
   * Seconds the skip-back / skip-forward controls jump.
   *
   * @defaultValue 10
   */
  seekStep?: number;

  /**
   * Loop playback when the track ends. Forwarded to the native `<audio>`.
   */
  loop?: boolean;

  /**
   * Begin playing as soon as the audio can. Forwarded to the native `<audio>`.
   */
  autoPlay?: boolean;
}

const formatTime = (seconds: number): string => {
  if (!Number.isFinite(seconds) || seconds < 0) seconds = 0;
  const total = Math.floor(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = h > 0 ? String(m).padStart(2, "0") : String(m);
  const out = `${mm}:${String(s).padStart(2, "0")}`;
  return h > 0 ? `${h}:${out}` : out;
};

const fileNameFromSrc = (src: string): string => {
  const clean = src.split(/[?#]/)[0];
  const seg = clean.split("/").filter(Boolean).pop() ?? src;
  try {
    return decodeURIComponent(seg);
  } catch {
    return seg;
  }
};

export const ElmAudioPlayer = ({
  className,
  style,
  src,
  title,
  artist,
  seekStep = 10,
  loop,
  autoPlay,
  ...rest
}: ElmAudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  // Ratio under the cursor while hovering the track — drives the seek preview.
  const [hoverRatio, setHoverRatio] = useState<number | null>(null);

  const progress = duration > 0 ? Math.min(1, currentTime / duration) : 0;

  // While playing, sample `currentTime` every frame so the playhead glides
  // instead of stepping with the ~4Hz `timeupdate` event.
  const startRaf = useCallback(() => {
    if (rafRef.current != null) return;
    const tick = () => {
      const audio = audioRef.current;
      if (audio) setCurrentTime(audio.currentTime);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const stopRaf = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  useEffect(() => stopRaf, [stopRaf]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      void audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  }, []);

  const seekTo = useCallback(
    (seconds: number) => {
      const audio = audioRef.current;
      if (!audio || !Number.isFinite(duration) || duration <= 0) return;
      const clamped = Math.max(0, Math.min(duration, seconds));
      audio.currentTime = clamped;
      setCurrentTime(clamped);
    },
    [duration],
  );

  const ratioFromPointer = useCallback((clientX: number): number => {
    const el = trackRef.current;
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0) return 0;
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  }, []);

  const handleTrackPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      event.currentTarget.setPointerCapture(event.pointerId);
      seekTo(ratioFromPointer(event.clientX) * duration);
    },
    [duration, ratioFromPointer, seekTo],
  );

  const handleTrackPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const ratio = ratioFromPointer(event.clientX);
      setHoverRatio(ratio);
      // A captured pointer means an active drag-scrub.
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        seekTo(ratio * duration);
      }
    },
    [duration, ratioFromPointer, seekTo],
  );

  const handleTrackKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        seekTo(currentTime + seekStep);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        seekTo(currentTime - seekStep);
      } else if (event.key === "Home") {
        event.preventDefault();
        seekTo(0);
      } else if (event.key === "End") {
        event.preventDefault();
        seekTo(duration);
      }
    },
    [currentTime, duration, seekStep, seekTo],
  );

  const changeVolume = useCallback((next: number) => {
    const audio = audioRef.current;
    const clamped = Math.max(0, Math.min(1, next));
    if (audio) {
      audio.volume = clamped;
      audio.muted = clamped === 0;
    }
    setVolume(clamped);
    setIsMuted(clamped === 0);
  }, []);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const next = !audio.muted;
    audio.muted = next;
    setIsMuted(next);
  }, []);

  const volumeIcon =
    isMuted || volume === 0
      ? mdiVolumeOff
      : volume < 0.34
        ? mdiVolumeLow
        : volume < 0.67
          ? mdiVolumeMedium
          : mdiVolumeHigh;

  const resolvedTitle = title ?? fileNameFromSrc(src);

  return (
    <div
      className={clsx(
        styles["elm-audio-player"],
        isPlaying && styles.playing,
        isLoading && styles.loading,
        hasError && styles.errored,
        className,
      )}
      style={
        {
          "--elmethis-scoped-progress": progress,
          "--elmethis-scoped-hover": hoverRatio ?? 0,
          ...style,
        } as CSSProperties
      }
      {...rest}
    >
      <audio
        ref={audioRef}
        src={src}
        loop={loop}
        autoPlay={autoPlay}
        preload="metadata"
        onLoadedMetadata={(e) => {
          setDuration(e.currentTarget.duration);
          setVolume(e.currentTarget.volume);
          setIsMuted(e.currentTarget.muted);
          setIsLoading(false);
        }}
        onDurationChange={(e) => setDuration(e.currentTarget.duration)}
        onCanPlay={() => setIsLoading(false)}
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => setIsLoading(false)}
        onTimeUpdate={(e) => {
          if (rafRef.current == null)
            setCurrentTime(e.currentTarget.currentTime);
        }}
        onPlay={() => {
          setIsPlaying(true);
          startRaf();
        }}
        onPause={() => {
          setIsPlaying(false);
          stopRaf();
        }}
        onEnded={() => {
          setIsPlaying(false);
          stopRaf();
        }}
        onVolumeChange={(e) => {
          setVolume(e.currentTarget.volume);
          setIsMuted(e.currentTarget.muted);
        }}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
      />

      <div className={styles.header}>
        <span className={styles.artwork} aria-hidden="true">
          <ElmMdiIcon d={mdiMusicNote} size="1.25rem" />
        </span>

        <div className={styles.meta}>
          <span className={styles.title} title={resolvedTitle}>
            {resolvedTitle}
          </span>
          {artist && <span className={styles.artist}>{artist}</span>}
        </div>

        {/* Now-playing equalizer — purely decorative, animates only while live. */}
        <span className={styles.equalizer} aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </span>
      </div>

      <div
        ref={trackRef}
        className={styles.seekbar}
        role="slider"
        tabIndex={0}
        aria-label="Seek"
        aria-valuemin={0}
        aria-valuemax={Math.round(duration) || 0}
        aria-valuenow={Math.round(currentTime)}
        aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
        onPointerDown={handleTrackPointerDown}
        onPointerMove={handleTrackPointerMove}
        onPointerLeave={() => setHoverRatio(null)}
        onKeyDown={handleTrackKeyDown}
      >
        <div className={styles.track} aria-hidden="true">
          <div className={styles.fill} />
        </div>
        {/* Faint marker that follows the cursor on hover. */}
        <span className={styles["hover-thumb"]} aria-hidden="true" />
        {/* Draggable handle parked at the play position. */}
        <span className={styles.thumb} aria-hidden="true" />
      </div>

      <div className={styles.controls}>
        <span className={clsx(styles.time, styles["time-current"])}>
          {formatTime(currentTime)}
        </span>

        <div className={styles["transport"]}>
          <button
            type="button"
            className={styles["icon-button"]}
            onClick={() => seekTo(currentTime - seekStep)}
            aria-label={`Back ${seekStep} seconds`}
          >
            <ElmMdiIcon d={mdiRewind10} size="1.25rem" />
          </button>

          <button
            type="button"
            className={styles["play-button"]}
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause" : "Play"}
            aria-pressed={isPlaying}
          >
            <ElmMdiIcon d={isPlaying ? mdiPause : mdiPlay} size="1.5rem" />
          </button>

          <button
            type="button"
            className={styles["icon-button"]}
            onClick={() => seekTo(currentTime + seekStep)}
            aria-label={`Forward ${seekStep} seconds`}
          >
            <ElmMdiIcon d={mdiFastForward10} size="1.25rem" />
          </button>
        </div>

        <div className={styles.volume}>
          <button
            type="button"
            className={styles["icon-button"]}
            onClick={toggleMute}
            aria-label={isMuted ? "Unmute" : "Mute"}
            aria-pressed={isMuted}
          >
            <ElmMdiIcon d={volumeIcon} size="1.25rem" />
          </button>
          <input
            className={styles["volume-slider"]}
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={isMuted ? 0 : volume}
            aria-label="Volume"
            onChange={(e) => changeVolume(e.currentTarget.valueAsNumber)}
            style={
              {
                "--elmethis-scoped-volume": isMuted ? 0 : volume,
              } as CSSProperties
            }
          />
        </div>

        <span className={clsx(styles.time, styles["time-total"])}>
          {formatTime(duration)}
        </span>
      </div>
    </div>
  );
};
