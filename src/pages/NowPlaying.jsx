import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PlayIcon, PauseIcon, ArrowLeftCircleIcon } from '@heroicons/react/24/solid';

export default function NowPlaying({ accessToken }) {
    const location = useLocation();
    const track = location.state?.track;
    const navigate = useNavigate();

    const [player, setPlayer] = useState(null);
    const [deviceId, setDeviceId] = useState(null);
    const [isPaused, setIsPaused] = useState(true);
    const [position, setPosition] = useState(0);
    const [duration, setDuration] = useState(0);

    // initialize Spotify Web Playback SDK
    useEffect(() => {
        if (!accessToken) return;

        const script = document.createElement('script');
        script.src = 'https://sdk.scdn.co/spotify-player.js';
        script.async = true;
        document.body.appendChild(script);

        window.onSpotifyWebPlaybackSDKReady = () => {
            const player = new window.Spotify.Player({
                name: 'Spotify Play App',
                getOAuthToken: (cb) => cb(accessToken),
                volume: 0.8,
            });

            player.addListener('ready', ({ device_id }) => setDeviceId(device_id));
            player.addListener('player_state_changed', (state) => {
                if (!state) return;
                setIsPaused(state.paused);
                setPosition(state.position);
                setDuration(state.duration);
            });

            player.connect();
            setPlayer(player);
        };
    }, [accessToken]);

    // play selected track
    useEffect(() => {
        const playTrack = async () => {
            if (!deviceId || !track) return;
            await fetch(
                `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
                {
                    method: 'PUT',
                    body: JSON.stringify({ uris: [track.uri] }),
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
        };
        playTrack();
    }, [deviceId, track, accessToken]);

    // update player position every 500ms
    useEffect(() => {
        if (!player) return;

        const interval = setInterval(async () => {
            const state = await player.getCurrentState();
            if (!state) return;
            setPosition(state.position);
            setDuration(state.duration);
            setIsPaused(state.paused);
        }, 500);

        return () => clearInterval(interval);
    }, [player]);

    // toggle play/pause
    const togglePlay = async () => {
        if (!player) return;
        const state = await player.getCurrentState();
        if (!state) return;

        if (state.paused) await player.resume();
        else await player.pause();
    };

    // toggle play/pause with spacebar
    useEffect(() => {
        const handleSpace = (e) => {
            if (e.code === 'Space' || e.key === ' ') {
                e.preventDefault();
                togglePlay();
            }
        };
        window.addEventListener('keydown', handleSpace);
        return () => window.removeEventListener('keydown', handleSpace);
    }, [player]);

    // stop song and navigate back
    const handleBack = async () => {
        if (player) await player.pause();
        navigate('/');
    };

    const formatTime = (ms) => {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${minutes.toString().padStart(2, '0')}:${seconds
            .toString()
            .padStart(2, '0')}`;
    };

    if (!track) {
        return (
            <div className='min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center justify-center'>
                <p>No track selected.</p>
                <button
                    onClick={handleBack}
                    className='mt-4 text-indigo-400 hover:underline'>
                    Back to search
                </button>
            </div>
        );
    }

    return (
        <div className='min-h-screen bg-gray-900 text-gray-100 p-8 flex flex-col items-center relative'>
            {/* back btn */}
            <button
                onClick={handleBack}
                className='absolute top-8 left-8 flex items-center text-indigo-400 hover:text-indigo-500'>
                <ArrowLeftCircleIcon className='w-5 h-5 mr-1' />
                BACK
            </button>

            {/* album name  */}
            <p className='font-inter text-md text-gray-400 mb-2 mt-10'>
                Album: {track.album.name}
            </p>

            {/* song cover */}
            <img
                src={track.album.images[0]?.url}
                alt={track.name}
                className='w-64 h-64 rounded-lg shadow-2xl mb-8'
            />

            {/* track name */}
            <h1 className='font-inter text-3xl font-semibold mb-2'>{track.name}</h1>

            {/* artists */}
            <p className='font-inter text-lg text-gray-400 mb-8'>
                {track.artists.map((a) => a.name).join(', ')}
            </p>

            {/* playbar */}
            <div className='flex flex-col items-center w-full max-w-md'>
                <input
                    type='range'
                    min={0}
                    max={duration}
                    value={position}
                    onChange={async (e) => {
                        const newPosition = Number(e.target.value);
                        if (player) await player.seek(newPosition);
                        setPosition(newPosition);
                    }}
                    className='w-full'
                />
                <div className='font-inter flex justify-between w-full text-sm text-gray-400'>
                    <span>{formatTime(position)}</span>
                    <span>{formatTime(duration - position)}</span>
                </div>

                <button
                    className='mt-4 p-3 bg-indigo-500 hover:bg-indigo-600 rounded-full shadow text-white flex items-center justify-center'
                    onClick={togglePlay}>
                    {isPaused ? (
                        <PlayIcon className='w-6 h-6' />
                    ) : (
                        <PauseIcon className='w-6 h-6' />
                    )}
                </button>
            </div>

            {/* <button
                onClick={handleBack}
                className='mt-6 text-indigo-400 hover:underline'>
                ← Back to search
            </button> */}
        </div>
    );
}
