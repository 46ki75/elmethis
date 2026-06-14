import {
  computed,
  defineComponent,
  onBeforeUnmount,
  ref,
  type CSSProperties,
  type HTMLAttributes,
} from "vue";
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
import { ElmMdiIcon } from "../icon/elm-mdi-icon";

export interface ElmAudioPlayerProps extends /* @vue-ignore */ HTMLAttributes {
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
  autoplay?: boolean;
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

export const ElmAudioPlayer = defineComponent({
  name: "ElmAudioPlayer",
  props: {
    src: { type: String, required: true },
    title: { type: String, default: undefined },
    artist: { type: String, default: undefined },
    errorMessage: {
      type: String,
      default: "This audio couldn't be loaded.",
    },
    seekStep: { type: Number, default: 10 },
    loop: { type: Boolean, default: undefined },
    autoplay: { type: Boolean, default: undefined },
  },
  setup(props) {
    const audioRef = ref<HTMLAudioElement | null>(null);
    const seekbarRef = ref<HTMLDivElement | null>(null);
    // rAF id lives outside reactivity — only `currentTime` needs to re-render.
    let rafId: number | null = null;

    const isPlaying = ref(false);
    const isLoading = ref(true);
    const hasError = ref(false);
    const duration = ref(0);
    const currentTime = ref(0);
    const volume = ref(1);
    const isMuted = ref(false);
    // Ratio under the cursor while hovering the track — drives the seek preview.
    const hoverRatio = ref<number | null>(null);

    const progress = computed(() =>
      duration.value > 0 ? Math.min(1, currentTime.value / duration.value) : 0,
    );

    const volumeIcon = computed(() => {
      if (isMuted.value || volume.value === 0) return mdiVolumeOff;
      if (volume.value < 0.34) return mdiVolumeLow;
      if (volume.value < 0.67) return mdiVolumeMedium;
      return mdiVolumeHigh;
    });

    const resolvedTitle = computed(
      () => props.title ?? fileNameFromSrc(props.src),
    );

    // While playing, sample `currentTime` every frame so the playhead glides
    // instead of stepping with the ~4Hz `timeupdate` event.
    const startRaf = (): void => {
      if (rafId != null) return;
      const tick = (): void => {
        if (audioRef.value) currentTime.value = audioRef.value.currentTime;
        rafId = requestAnimationFrame(tick);
      };
      rafId = requestAnimationFrame(tick);
    };

    const stopRaf = (): void => {
      if (rafId != null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    };

    onBeforeUnmount(stopRaf);

    const togglePlay = (): void => {
      const audio = audioRef.value;
      if (!audio) return;
      if (audio.paused) {
        void audio.play().catch(() => (isPlaying.value = false));
      } else {
        audio.pause();
      }
    };

    const seekTo = (seconds: number): void => {
      const audio = audioRef.value;
      if (!audio || !Number.isFinite(duration.value) || duration.value <= 0) {
        return;
      }
      const clamped = Math.max(0, Math.min(duration.value, seconds));
      audio.currentTime = clamped;
      currentTime.value = clamped;
    };

    const ratioFromClientX = (clientX: number): number => {
      const el = seekbarRef.value;
      if (!el) return 0;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0) return 0;
      return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    };

    const handlePointerDown = (event: PointerEvent): void => {
      (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
      seekTo(ratioFromClientX(event.clientX) * duration.value);
    };

    const handlePointerMove = (event: PointerEvent): void => {
      const ratio = ratioFromClientX(event.clientX);
      hoverRatio.value = ratio;
      // A captured pointer means an active drag-scrub.
      if (
        (event.currentTarget as HTMLElement).hasPointerCapture(event.pointerId)
      ) {
        seekTo(ratio * duration.value);
      }
    };

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        seekTo(currentTime.value + props.seekStep);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        seekTo(currentTime.value - props.seekStep);
      } else if (event.key === "Home") {
        event.preventDefault();
        seekTo(0);
      } else if (event.key === "End") {
        event.preventDefault();
        seekTo(duration.value);
      }
    };

    const changeVolume = (next: number): void => {
      const audio = audioRef.value;
      const clamped = Math.max(0, Math.min(1, next));
      if (audio) {
        audio.volume = clamped;
        audio.muted = clamped === 0;
      }
      volume.value = clamped;
      isMuted.value = clamped === 0;
    };

    const toggleMute = (): void => {
      const audio = audioRef.value;
      if (!audio) return;
      const next = !audio.muted;
      audio.muted = next;
      isMuted.value = next;
    };

    // inheritAttrs default: passthrough class/style merge onto the root.
    return () => (
      <div
        class={clsx(
          styles["elm-audio-player"],
          isPlaying.value && styles.playing,
          isLoading.value && styles.loading,
          hasError.value && styles.errored,
        )}
        style={
          {
            "--elmethis-scoped-progress": progress.value,
            "--elmethis-scoped-hover": hoverRatio.value ?? 0,
          } as CSSProperties
        }
      >
        <audio
          ref={audioRef}
          src={props.src}
          loop={props.loop}
          autoplay={props.autoplay}
          preload="metadata"
          onLoadedmetadata={() => {
            const audio = audioRef.value;
            if (!audio) return;
            duration.value = audio.duration;
            volume.value = audio.volume;
            isMuted.value = audio.muted;
            isLoading.value = false;
          }}
          onDurationchange={() => {
            if (audioRef.value) duration.value = audioRef.value.duration;
          }}
          onCanplay={() => (isLoading.value = false)}
          onWaiting={() => (isLoading.value = true)}
          onPlaying={() => (isLoading.value = false)}
          onTimeupdate={() => {
            if (rafId == null && audioRef.value) {
              currentTime.value = audioRef.value.currentTime;
            }
          }}
          onPlay={() => {
            isPlaying.value = true;
            startRaf();
          }}
          onPause={() => {
            isPlaying.value = false;
            stopRaf();
          }}
          onEnded={() => {
            isPlaying.value = false;
            stopRaf();
          }}
          onVolumechange={() => {
            const audio = audioRef.value;
            if (!audio) return;
            volume.value = audio.volume;
            isMuted.value = audio.muted;
          }}
          onError={() => {
            hasError.value = true;
            isLoading.value = false;
          }}
        />

        <div class={styles.header}>
          <span
            class={clsx(
              styles.artwork,
              hasError.value && styles["artwork-error"],
            )}
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
            {props.artist && <span class={styles.artist}>{props.artist}</span>}
          </div>

          {/* Now-playing equalizer — decorative, animates only while live. */}
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
            <span class={styles["error-message"]}>{props.errorMessage}</span>
          </div>
        ) : (
          <>
            <div
              ref={seekbarRef}
              class={styles.seekbar}
              role="slider"
              tabindex={0}
              aria-label="Seek"
              aria-valuemin={0}
              aria-valuemax={Math.round(duration.value) || 0}
              aria-valuenow={Math.round(currentTime.value)}
              aria-valuetext={`${formatTime(currentTime.value)} of ${formatTime(
                duration.value,
              )}`}
              onPointerdown={handlePointerDown}
              onPointermove={handlePointerMove}
              onPointerleave={() => (hoverRatio.value = null)}
              onKeydown={handleKeyDown}
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
              <span class={clsx(styles.time, styles["time-current"])}>
                {formatTime(currentTime.value)}
              </span>

              <div class={styles["transport"]}>
                <button
                  type="button"
                  class={styles["icon-button"]}
                  onClick={() => seekTo(currentTime.value - props.seekStep)}
                  aria-label={`Back ${props.seekStep} seconds`}
                >
                  <ElmMdiIcon d={mdiRewind10} size="1.25rem" />
                </button>

                <button
                  type="button"
                  class={styles["play-button"]}
                  onClick={togglePlay}
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
                  onClick={() => seekTo(currentTime.value + props.seekStep)}
                  aria-label={`Forward ${props.seekStep} seconds`}
                >
                  <ElmMdiIcon d={mdiFastForward10} size="1.25rem" />
                </button>
              </div>

              <div class={styles.volume}>
                <button
                  type="button"
                  class={styles["icon-button"]}
                  onClick={toggleMute}
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
                  onInput={(e) =>
                    changeVolume((e.target as HTMLInputElement).valueAsNumber)
                  }
                  style={
                    {
                      "--elmethis-scoped-volume": isMuted.value
                        ? 0
                        : volume.value,
                    } as CSSProperties
                  }
                />
              </div>

              <span class={clsx(styles.time, styles["time-total"])}>
                {formatTime(duration.value)}
              </span>
            </div>
          </>
        )}
      </div>
    );
  },
});
