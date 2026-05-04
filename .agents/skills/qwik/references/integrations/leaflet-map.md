# Integration: Leaflet Maps

> Source: `packages/docs/src/routes/docs/integrations/leaflet-map/index.mdx`

## Installation

```bash
pnpm run qwik add leaflet-map
```

Installs `leaflet@1.9.4` and `@types/leaflet@1.9.4`, creates helper files and a demo route.

## Core pattern

Leaflet manipulates the DOM directly, so it must be initialized inside `useVisibleTask$`. Use `noSerialize` to prevent Qwik from trying to serialize the map instance.

```tsx
import { component$, useSignal, useVisibleTask$, noSerialize } from '@builder.io/qwik';
import * as L from 'leaflet';
import leafletStyles from 'leaflet/dist/leaflet.css?inline';

export const LeafletMap = component$(() => {
  const mapRef = useSignal<L.Map>();

  useVisibleTask$(({ cleanup }) => {
    const map = L.map('map').setView([46.066, 13.237], 10);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap',
    }).addTo(map);

    mapRef.value = noSerialize(map);
    cleanup(() => map.remove());
  });

  return <div id="map" style={{ height: '25rem' }} />;
});
```

## Tracking signals

When the map needs to react to Qwik state changes (location, markers), `track()` signals inside `useVisibleTask$` and re-initialize the map:

```tsx
useVisibleTask$(({ track }) => {
  track(locationSignal);
  track(groupSignal);
  // Remove previous map and re-create
  mapRef.value?.remove();
  // ... re-initialize
});
```

## Key points

- Import Leaflet CSS with `?inline` and apply via `useStyles$`.
- Use `noSerialize()` for the `L.Map` instance — it cannot be serialized.
- Always call `map.remove()` in the cleanup function.
- GeoJSON layers: `L.geoJSON(data, { style }).addTo(map)`.
- Custom markers: `L.divIcon({ html: '<svg>...</svg>', className: '' })`.
