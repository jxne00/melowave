# Spotify Play

A Spotify search application built with React, Vite, and TailwindCSS. Users can log in via Spotify, search for tracks, explore track details and play tracks.

## Features

-   Spotify OAuth with PKCE flow
-   Search for tracks
-   View track details (album, artist)
-   Play tracks with playback controls

## Demo

This app is deployed on [spotify-play-rho.vercel.app](spotify-play-rho.vercel.app).

## Setup

1. Clone this repository:
    ```bash
    git clone https://github.com/jxne00/spotify-play.git
    ```
2. Install dependencies:
    ```bash
    npm install
    ```
3. Create .env file with Spotify credentials:

    ```bash
    VITE_SPOTIFY_CLIENT_ID=your_client_id
    VITE_SPOTIFY_REDIRECT_URI=your_redirect_uri
    ```

4. Run locally
    ```bash
    npm run dev
    ```
