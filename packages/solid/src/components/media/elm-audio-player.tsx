import {
  createEffect,
  createMemo,
  createSignal,
  mergeProps,
  onCleanup,
  splitProps,
  type JSX,
} from "solid-js";
import { clsx } from "clsx";
import {
  mdiAlertCircleOutline,
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
import { mergeStyle } from "../../styles/merge-style";
import { ElmMdiIcon } from "../icon/elm-mdi-icon";

export interface ElmAudioPlayerProps extends Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "title"
> {
  /** Audio source URL. */
  src: string;

  /** Track title shown in the header. Falls back to the file name in `src`. */
  title?: string;

  /** Secondary line under the title (artist, album, podcast name, ...). */
  artist?: string;

  /**
   * Message shown when the audio fails to load.
   * @defaultValue "This audio couldn't be loaded."
   */
  errorMessage?: string;

  /**
   * Seconds the skip-back / skip-forward controls jump.
   * @defaultValue 10
   */
  seekStep?: number;

  /** Loop playback when the track ends. Forwarded to the native `<audio>`. */
  loop?: boolean;

  /** Begin playing when the audio can. Forwarded to the native `<audio>`. */
  autoPlay?: boolean;
}

const formatTime = (seconds: number): string => {
  if (!Number.isFinite(seconds) || seconds < 0) seconds = 0;
  const total = Math.floor(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const remainingSeconds = total % 60;
  const minuteText =
    hours > 0 ? String(minutes).padStart(2, "0") : String(minutes);
  const output = `${minuteText}:${String(remainingSeconds).padStart(2, "0")}`;
  return hours > 0 ? `${hours}:${output}` : output;
};

const fileNameFromSrc = (src: string): string => {
  const clean = src.split(/[?#]/)[0];
  const segment = clean.split("/").filter(Boolean).pop() ?? src;
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
};

export const ElmAudioPlayer = (props: ElmAudioPlayerProps) => {
  const merged = mergeProps(
    {
      errorMessage: "This audio couldn't be loaded.",
      seekStep: 10,
    },
    props,
  );
  const [local, rest] = splitProps(merged, [
    "class",
    "style",
    "src",
    "title",
    "artist",
    "errorMessage",
    "seekStep",
    "loop",
    "autoPlay",
  ]);

  let audioRef!: HTMLAudioElement;
  let trackRef!: HTMLDivElement;
  let rafId: number | null = null;

  const [isPlaying, setIsPlaying] = createSignal(false);
  const [isLoading, setIsLoading] = createSignal(true);
  const [hasError, setHasError] = createSignal(false);
  const [duration, setDuration] = createSignal(0);
  const [currentTime, setCurrentTime] = createSignal(0);
  const [volume, setVolume] = createSignal(1);
  const [isMuted, setIsMuted] = createSignal(false);
  const [hoverRatio, setHoverRatio] = createSignal<number | null>(null);

  const progress = createMemo(() =>
    duration() > 0 ? Math.min(1, currentTime() / duration()) : 0,
  );
  const resolvedTitle = createMemo(
    () => local.title ?? fileNameFromSrc(local.src),
  );
  const volumeIcon = createMemo(() => {
    if (isMuted() || volume() === 0) return mdiVolumeOff;
    if (volume() < 0.34) return mdiVolumeLow;
    if (volume() < 0.67) return mdiVolumeMedium;
    return mdiVolumeHigh;
  });

  const stopRaf = (): void => {
    if (rafId == null) return;
    cancelAnimationFrame(rafId);
    rafId = null;
  };

  const startRaf = (): void => {
    if (rafId != null) return;
    const tick = (): void => {
      if (audioRef) setCurrentTime(audioRef.currentTime);
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
  };

  onCleanup(stopRaf);

  let activeSrc: string | undefined;
  createEffect(() => {
    const nextSrc = local.src;
    if (activeSrc === undefined) {
      activeSrc = nextSrc;
      return;
    }
    if (nextSrc === activeSrc) return;
    activeSrc = nextSrc;

    stopRaf();
    setIsPlaying(false);
    setIsLoading(true);
    setHasError(false);
    setDuration(0);
    setCurrentTime(0);
    setHoverRatio(null);
  });

  const togglePlay = (): void => {
    if (!audioRef) return;
    if (audioRef.paused) {
      void audioRef.play().catch(() => setIsPlaying(false));
    } else {
      audioRef.pause();
    }
  };

  const seekTo = (seconds: number): void => {
    const totalDuration = duration();
    if (!audioRef || !Number.isFinite(totalDuration) || totalDuration <= 0) {
      return;
    }
    const clamped = Math.max(0, Math.min(totalDuration, seconds));
    audioRef.currentTime = clamped;
    setCurrentTime(clamped);
  };

  const ratioFromPointer = (clientX: number): number => {
    if (!trackRef) return 0;
    const rect = trackRef.getBoundingClientRect();
    if (rect.width === 0) return 0;
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  };

  const handleTrackPointerDown: JSX.EventHandler<
    HTMLDivElement,
    PointerEvent
  > = (event) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    seekTo(ratioFromPointer(event.clientX) * duration());
  };

  const handleTrackPointerMove: JSX.EventHandler<
    HTMLDivElement,
    PointerEvent
  > = (event) => {
    const ratio = ratioFromPointer(event.clientX);
    setHoverRatio(ratio);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      seekTo(ratio * duration());
    }
  };

  const handleTrackKeyDown: JSX.EventHandler<HTMLDivElement, KeyboardEvent> = (
    event,
  ) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      seekTo(currentTime() + local.seekStep);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      seekTo(currentTime() - local.seekStep);
    } else if (event.key === "Home") {
      event.preventDefault();
      seekTo(0);
    } else if (event.key === "End") {
      event.preventDefault();
      seekTo(duration());
    }
  };

  const changeVolume = (next: number): void => {
    const clamped = Math.max(0, Math.min(1, next));
    if (audioRef) {
      audioRef.volume = clamped;
      audioRef.muted = clamped === 0;
    }
    setVolume(clamped);
    setIsMuted(clamped === 0);
  };

  const toggleMute = (): void => {
    if (!audioRef) return;
    const next = !audioRef.muted;
    audioRef.muted = next;
    setIsMuted(next);
  };

  return (
    <div
      {...rest}
      class={clsx(
        styles["elm-audio-player"],
        isPlaying() && styles.playing,
        isLoading() && styles.loading,
        hasError() && styles.errored,
        local.class,
      )}
      style={mergeStyle(local.style, {
        "--elmethis-scoped-progress": progress(),
        "--elmethis-scoped-hover": hoverRatio() ?? 0,
      })}
    >
      <audio
        ref={(element) => {
          audioRef = element;
        }}
        class={styles["native-audio"]}
        src={local.src}
        loop={local.loop}
        autoplay={local.autoPlay}
        preload="metadata"
        onLoadedMetadata={(event) => {
          setDuration(event.currentTarget.duration);
          setVolume(event.currentTarget.volume);
          setIsMuted(event.currentTarget.muted);
          setIsLoading(false);
        }}
        onDurationChange={(event) => setDuration(event.currentTarget.duration)}
        onCanPlay={() => setIsLoading(false)}
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => setIsLoading(false)}
        onTimeUpdate={(event) => {
          if (rafId == null) setCurrentTime(event.currentTarget.currentTime);
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
        onVolumeChange={(event) => {
          setVolume(event.currentTarget.volume);
          setIsMuted(event.currentTarget.muted);
        }}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
      />

      <div class={styles.header}>
        <span
          class={clsx(styles.artwork, hasError() && styles["artwork-error"])}
          aria-hidden="true"
        >
          <ElmMdiIcon
            d={hasError() ? mdiAlertCircleOutline : mdiMusicNote}
            size="1.25rem"
          />
        </span>

        <div class={styles.meta}>
          <span class={styles.title} title={resolvedTitle()}>
            {resolvedTitle()}
          </span>
          {local.artist && <span class={styles.artist}>{local.artist}</span>}
        </div>

        <span class={styles.equalizer} aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </span>
      </div>

      {hasError() ? (
        <div class={styles["error-notice"]} role="alert">
          <ElmMdiIcon d={mdiAlertCircleOutline} size="1.25rem" />
          <span class={styles["error-message"]}>{local.errorMessage}</span>
        </div>
      ) : (
        <>
          <div
            ref={(element) => {
              trackRef = element;
            }}
            class={styles.seekbar}
            role="slider"
            tabIndex={0}
            aria-label="Seek"
            aria-valuemin={0}
            aria-valuemax={Math.round(duration()) || 0}
            aria-valuenow={Math.round(currentTime())}
            aria-valuetext={`${formatTime(currentTime())} of ${formatTime(duration())}`}
            onPointerDown={handleTrackPointerDown}
            onPointerMove={handleTrackPointerMove}
            onPointerLeave={() => setHoverRatio(null)}
            onKeyDown={handleTrackKeyDown}
          >
            <div class={styles.track} aria-hidden="true">
              <div class={styles.fill} />
            </div>
            <span class={styles["hover-thumb"]} aria-hidden="true" />
            <span class={styles.thumb} aria-hidden="true" />
          </div>

          <div class={styles.controls}>
            <span class={clsx(styles.time, styles["time-current"])}>
              {formatTime(currentTime())}
            </span>

            <div class={styles.transport}>
              <button
                type="button"
                class={styles["icon-button"]}
                onClick={() => seekTo(currentTime() - local.seekStep)}
                aria-label={`Back ${local.seekStep} seconds`}
              >
                <ElmMdiIcon d={mdiRewind10} size="1.25rem" />
              </button>

              <button
                type="button"
                class={styles["play-button"]}
                onClick={togglePlay}
                aria-label={isPlaying() ? "Pause" : "Play"}
                aria-pressed={isPlaying()}
              >
                <ElmMdiIcon
                  d={isPlaying() ? mdiPause : mdiPlay}
                  size="1.5rem"
                />
              </button>

              <button
                type="button"
                class={styles["icon-button"]}
                onClick={() => seekTo(currentTime() + local.seekStep)}
                aria-label={`Forward ${local.seekStep} seconds`}
              >
                <ElmMdiIcon d={mdiFastForward10} size="1.25rem" />
              </button>
            </div>

            <div class={styles.volume}>
              <button
                type="button"
                class={styles["icon-button"]}
                onClick={toggleMute}
                aria-label={isMuted() ? "Unmute" : "Mute"}
                aria-pressed={isMuted()}
              >
                <ElmMdiIcon d={volumeIcon()} size="1.25rem" />
              </button>
              <input
                class={styles["volume-slider"]}
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={isMuted() ? 0 : volume()}
                aria-label="Volume"
                onInput={(event) =>
                  changeVolume(event.currentTarget.valueAsNumber)
                }
                style={{
                  "--elmethis-scoped-volume": isMuted() ? 0 : volume(),
                }}
              />
            </div>

            <span class={clsx(styles.time, styles["time-total"])}>
              {formatTime(duration())}
            </span>
          </div>
        </>
      )}
    </div>
  );
};
