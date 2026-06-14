import {
  $,
  component$,
  PropsOf,
  useComputed$,
  useSignal,
  useVisibleTask$,
} from "@qwik.dev/core";
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
import { ElmMdiIcon } from "../icon/elm-mdi-icon";

export interface ElmAudioPlayerProps extends Omit<PropsOf<"div">, "title"> {
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
   * Message shown when the audio fails to load (bad URL, network/CORS error,
   * unsupported codec). Replaces the transport with a labeled alert.
   *
   * @defaultValue "This audio couldn't be loaded."
   */
  errorMessage?: string;

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

export const ElmAudioPlayer = component$<ElmAudioPlayerProps>((props) => {
  const {
    class: className,
    src,
    title,
    artist,
    errorMessage = "This audio couldn't be loaded.",
    seekStep = 10,
    loop,
    autoPlay,
    ...rest
  } = props;

  const audioRef = useSignal<HTMLAudioElement>();
  const rafId = useSignal<number | null>(null);

  const isPlaying = useSignal(false);
  const isLoading = useSignal(true);
  const hasError = useSignal(false);
  const duration = useSignal(0);
  const currentTime = useSignal(0);
  const volume = useSignal(1);
  const isMuted = useSignal(false);
  // Ratio under the cursor while hovering the track — drives the seek preview.
  const hoverRatio = useSignal<number | null>(null);

  const progress = useComputed$(() =>
    duration.value > 0 ? Math.min(1, currentTime.value / duration.value) : 0,
  );

  const volumeIcon = useComputed$(() => {
    if (isMuted.value || volume.value === 0) return mdiVolumeOff;
    if (volume.value < 0.34) return mdiVolumeLow;
    if (volume.value < 0.67) return mdiVolumeMedium;
    return mdiVolumeHigh;
  });

  const resolvedTitle = useComputed$(() => title ?? fileNameFromSrc(src));

  // While playing, sample `currentTime` every frame so the playhead glides
  // instead of stepping with the ~4Hz `timeupdate` event.
  const startRaf = $(() => {
    if (rafId.value != null) return;
    const tick = (): void => {
      if (audioRef.value) currentTime.value = audioRef.value.currentTime;
      rafId.value = requestAnimationFrame(tick);
    };
    rafId.value = requestAnimationFrame(tick);
  });

  const stopRaf = $(() => {
    if (rafId.value != null) {
      cancelAnimationFrame(rafId.value);
      rafId.value = null;
    }
  });

  // Stop the rAF loop if the player unmounts mid-playback.
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ cleanup }) => {
    cleanup(() => {
      if (rafId.value != null) cancelAnimationFrame(rafId.value);
    });
  });

  const togglePlay = $(() => {
    const audio = audioRef.value;
    if (!audio) return;
    if (audio.paused) {
      void audio.play().catch(() => (isPlaying.value = false));
    } else {
      audio.pause();
    }
  });

  const seekTo = $((seconds: number) => {
    const audio = audioRef.value;
    if (!audio || !Number.isFinite(duration.value) || duration.value <= 0) {
      return;
    }
    const clamped = Math.max(0, Math.min(duration.value, seconds));
    audio.currentTime = clamped;
    currentTime.value = clamped;
  });

  const changeVolume = $((next: number) => {
    const audio = audioRef.value;
    const clamped = Math.max(0, Math.min(1, next));
    if (audio) {
      audio.volume = clamped;
      audio.muted = clamped === 0;
    }
    volume.value = clamped;
    isMuted.value = clamped === 0;
  });

  const toggleMute = $(() => {
    const audio = audioRef.value;
    if (!audio) return;
    const next = !audio.muted;
    audio.muted = next;
    isMuted.value = next;
  });

  return (
    <div
      class={[
        styles["elm-audio-player"],
        isPlaying.value && styles.playing,
        isLoading.value && styles.loading,
        hasError.value && styles.errored,
        className,
      ]}
      style={{
        "--elmethis-scoped-progress": progress.value,
        "--elmethis-scoped-hover": hoverRatio.value ?? 0,
      }}
      {...rest}
    >
      <audio
        ref={audioRef}
        src={src}
        loop={loop}
        autoplay={autoPlay}
        preload="metadata"
        onLoadedMetadata$={(_, el) => {
          duration.value = el.duration;
          volume.value = el.volume;
          isMuted.value = el.muted;
          isLoading.value = false;
        }}
        onDurationChange$={(_, el) => (duration.value = el.duration)}
        onCanPlay$={() => (isLoading.value = false)}
        onWaiting$={() => (isLoading.value = true)}
        onPlaying$={() => (isLoading.value = false)}
        onTimeUpdate$={(_, el) => {
          if (rafId.value == null) currentTime.value = el.currentTime;
        }}
        onPlay$={() => {
          isPlaying.value = true;
          startRaf();
        }}
        onPause$={() => {
          isPlaying.value = false;
          stopRaf();
        }}
        onEnded$={() => {
          isPlaying.value = false;
          stopRaf();
        }}
        onVolumeChange$={(_, el) => {
          volume.value = el.volume;
          isMuted.value = el.muted;
        }}
        onError$={() => {
          hasError.value = true;
          isLoading.value = false;
        }}
      />

      <div class={styles.header}>
        <span
          class={[styles.artwork, hasError.value && styles["artwork-error"]]}
          aria-hidden="true"
        >
          <ElmMdiIcon
            d={hasError.value ? mdiAlertCircleOutline : mdiMusicNote}
            size="1.25rem"
          />
        </span>

        <div class={styles.meta}>
          <span class={styles.title} title={resolvedTitle.value}>
            {resolvedTitle.value}
          </span>
          {artist && <span class={styles.artist}>{artist}</span>}
        </div>

        {/* Now-playing equalizer — purely decorative, animates only while live. */}
        <span class={styles.equalizer} aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </span>
      </div>

      {hasError.value ? (
        <div class={styles["error-notice"]} role="alert">
          <ElmMdiIcon d={mdiAlertCircleOutline} size="1.25rem" />
          <span class={styles["error-message"]}>{errorMessage}</span>
        </div>
      ) : (
        <>
          <div
            class={styles.seekbar}
            role="slider"
            tabIndex={0}
            aria-label="Seek"
            aria-valuemin={0}
            aria-valuemax={Math.round(duration.value) || 0}
            aria-valuenow={Math.round(currentTime.value)}
            aria-valuetext={`${formatTime(currentTime.value)} of ${formatTime(
              duration.value,
            )}`}
            onPointerDown$={(event, el) => {
              el.setPointerCapture(event.pointerId);
              const rect = el.getBoundingClientRect();
              const ratio =
                rect.width === 0
                  ? 0
                  : Math.max(
                      0,
                      Math.min(1, (event.clientX - rect.left) / rect.width),
                    );
              seekTo(ratio * duration.value);
            }}
            onPointerMove$={(event, el) => {
              const rect = el.getBoundingClientRect();
              const ratio =
                rect.width === 0
                  ? 0
                  : Math.max(
                      0,
                      Math.min(1, (event.clientX - rect.left) / rect.width),
                    );
              hoverRatio.value = ratio;
              // A captured pointer means an active drag-scrub.
              if (el.hasPointerCapture(event.pointerId)) {
                seekTo(ratio * duration.value);
              }
            }}
            onPointerLeave$={() => (hoverRatio.value = null)}
            onKeyDown$={(event) => {
              if (event.key === "ArrowRight") {
                event.preventDefault();
                seekTo(currentTime.value + seekStep);
              } else if (event.key === "ArrowLeft") {
                event.preventDefault();
                seekTo(currentTime.value - seekStep);
              } else if (event.key === "Home") {
                event.preventDefault();
                seekTo(0);
              } else if (event.key === "End") {
                event.preventDefault();
                seekTo(duration.value);
              }
            }}
          >
            <div class={styles.track} aria-hidden="true">
              <div class={styles.fill} />
            </div>
            {/* Faint marker that follows the cursor on hover. */}
            <span class={styles["hover-thumb"]} aria-hidden="true" />
            {/* Draggable handle parked at the play position. */}
            <span class={styles.thumb} aria-hidden="true" />
          </div>

          <div class={styles.controls}>
            <span class={[styles.time, styles["time-current"]]}>
              {formatTime(currentTime.value)}
            </span>

            <div class={styles["transport"]}>
              <button
                type="button"
                class={styles["icon-button"]}
                onClick$={() => seekTo(currentTime.value - seekStep)}
                aria-label={`Back ${seekStep} seconds`}
              >
                <ElmMdiIcon d={mdiRewind10} size="1.25rem" />
              </button>

              <button
                type="button"
                class={styles["play-button"]}
                onClick$={togglePlay}
                aria-label={isPlaying.value ? "Pause" : "Play"}
                aria-pressed={isPlaying.value}
              >
                <ElmMdiIcon
                  d={isPlaying.value ? mdiPause : mdiPlay}
                  size="1.5rem"
                />
              </button>

              <button
                type="button"
                class={styles["icon-button"]}
                onClick$={() => seekTo(currentTime.value + seekStep)}
                aria-label={`Forward ${seekStep} seconds`}
              >
                <ElmMdiIcon d={mdiFastForward10} size="1.25rem" />
              </button>
            </div>

            <div class={styles.volume}>
              <button
                type="button"
                class={styles["icon-button"]}
                onClick$={toggleMute}
                aria-label={isMuted.value ? "Unmute" : "Mute"}
                aria-pressed={isMuted.value}
              >
                <ElmMdiIcon d={volumeIcon.value} size="1.25rem" />
              </button>
              <input
                class={styles["volume-slider"]}
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={isMuted.value ? 0 : volume.value}
                aria-label="Volume"
                onInput$={(_, el) => changeVolume(el.valueAsNumber)}
                style={{
                  "--elmethis-scoped-volume": isMuted.value ? 0 : volume.value,
                }}
              />
            </div>

            <span class={[styles.time, styles["time-total"]]}>
              {formatTime(duration.value)}
            </span>
          </div>
        </>
      )}
    </div>
  );
});
