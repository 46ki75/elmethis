# Cookbook: Media Controller (iOS-compatible)

> Source: `packages/docs/src/routes/docs/cookbook/mediaController/index.mdx`

## Problem

iOS blocks media playback unless it is initiated **synchronously** within a user gesture handler. Qwik's `onClick$` (a QRL) is asynchronous, so the first tap is blocked on iOS — a second tap is required.

## Solution

Attach the `.play()` / `.pause()` call directly via a synchronous `addEventListener` inside `useVisibleTask$`. This satisfies iOS's requirement that playback be directly triggered by user interaction.

```tsx
import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';

export default component$(() => {
  const videoRef = useSignal<HTMLVideoElement>();
  const playBtnRef = useSignal<HTMLButtonElement>();
  const isPlaying = useSignal(false);

  useVisibleTask$(({ track }) => {
    track(() => playBtnRef.value);
    track(() => videoRef.value);

    const toggle = () =>
      isPlaying.value ? videoRef.value?.pause() : videoRef.value?.play();

    playBtnRef.value?.addEventListener('click', toggle);
    return () => playBtnRef.value?.removeEventListener('click', toggle);
  });

  return (
    <>
      <video
        ref={videoRef}
        src="/video.mp4"
        playsinline          // Required: prevents iOS fullscreen
        onPlay$={() => (isPlaying.value = true)}
        onPause$={() => (isPlaying.value = false)}
        onEnded$={() => (isPlaying.value = false)}
      />
      <button ref={playBtnRef}>
        {isPlaying.value ? 'Pause' : 'Play'}
      </button>
    </>
  );
});
```

## Key points

- `useVisibleTask$` runs client-side after the element mounts.
- `track()` re-runs the task when the ref changes.
- `playsinline` keeps the video inline on iOS (avoids auto-fullscreen).
- The cleanup function (`return () => ...`) removes the listener on unmount.
- The same pattern applies to `<audio>` elements.
