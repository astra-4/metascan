# metascan


# MetaScan

See what your photos reveal before you post them.

Drop in an image and MetaScan reads the data hidden inside it . Includes GPS coordinates, camera model, timestamps, faces, QR codes. It scores the privacy risk, and lets you strip it all out in one click.

**Everything runs in your browser.** No uploads, no server, no accounts. Close the tab and it's gone.

## Features

- **EXIF metadata scan** — camera make/model, lens, exposure settings, software
- **GPS extraction** — plots the exact location on a map
- **Face detection** — counts recognizable people in frame
- **QR code decoding** — reveals what that code in the background actually links to
- **Privacy score** — 0–100 with a breakdown of what cost you points
- **Metadata explorer** — every field, in plain English
- **One-click sanitize** — blurs faces and QR codes, strips all metadata, downloads a clean copy

## Usage

Open deployment and you can just begin.

You could also use the samples if you'd like


## Built with

JS, HTML/CSS. Uses [exifr](https://github.com/MikeKovarik/exifr) for metadata, [jsQR](https://github.com/cozmo/jsQR) for QR codes, [face-api.js](https://github.com/justadudewhohacks/face-api.js) for face detection, and [Leaflet](https://leafletjs.com) + OpenStreetMap for the map.

## Why

Many people don't know that metadata even exists and that it can leak lots of info about them.
