import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    PlayIcon,
    PauseIcon,
    ArrowLeftCircleIcon,
    QrCodeIcon,
    ArrowDownTrayIcon,
    XMarkIcon,
} from '@heroicons/react/24/solid';
import './NowPlaying.css';

export default function NowPlaying({ accessToken }) {
    const location = useLocation();
    const track = location.state?.track;
    const navigate = useNavigate();

    const [player, setPlayer] = useState(null);
    const [deviceId, setDeviceId] = useState(null);
    const [isPaused, setIsPaused] = useState(true);
    const [position, setPosition] = useState(0);
    const [duration, setDuration] = useState(0);

    // spotifycode
    const [showCode, setShowCode] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

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

    const togglePlay = async () => {
        if (!player) return;
        const state = await player.getCurrentState();
        if (!state) return;
        if (state.paused) await player.resume();
        else await player.pause();
    };

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

    const openModal = (variant) => {
        setShowCode(variant);
        setModalVisible(true);
    };

    const closeModal = () => {
        // trigger animation
        setModalVisible(false);
        // wait for animation to finish before removing modal
        setTimeout(() => setShowCode(null), 250);
    };

    const spotifyCodeDark = `https://scannables.scdn.co/uri/plain/jpeg/000000/white/640/spotify:track:${track?.id}`;
    const spotifyCodeLight = `https://scannables.scdn.co/uri/plain/jpeg/FFFFFF/black/640/spotify:track:${track?.id}`;

    // download spotifycode jpg
    const handleDownload = async (variant) => {
        const url = variant === 'dark' ? spotifyCodeDark : spotifyCodeLight;
        const response = await fetch(url);
        const blob = await response.blob();
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `spotify-code-${variant}-${track.id}.jpg`;
        link.click();
        URL.revokeObjectURL(link.href);
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
            {/* back button */}
            <div className='flex justify-between w-full items-center'>
                <button
                    onClick={async () => {
                        if (player) await player.pause();
                        navigate('/');
                    }}
                    className='flex items-center text-indigo-400 hover:text-indigo-500'>
                    <ArrowLeftCircleIcon className='w-5 h-5 mr-1' />
                    BACK
                </button>

                {/* show code buttons */}
                <div className='flex space-x-4'>
                    <button
                        onClick={() => openModal('dark')}
                        className='p-3 bg-gray-800 hover:bg-gray-700 rounded-full shadow'>
                        <QrCodeIcon className='w-6 h-6 text-white' />
                    </button>
                    <button
                        onClick={() => openModal('light')}
                        className='p-3 bg-white hover:bg-gray-100 rounded-full shadow'>
                        <QrCodeIcon className='w-6 h-6 text-gray-800' />
                    </button>
                </div>
            </div>

            {/* album */}
            <p className='font-inter text-md text-gray-400 mb-2 mt-20'>
                Album: {track.album.name}
            </p>

            {/* cover */}
            <img
                src={track.album.images[0]?.url}
                alt={track.name}
                className='w-64 h-64 rounded-lg shadow-2xl mb-8'
            />

            {/* track info */}
            <h1 className='font-inter text-3xl font-semibold mb-2'>{track.name}</h1>
            <p className='font-inter text-lg text-gray-400 mb-8'>
                {track.artists.map((a) => a.name).join(', ')}
            </p>

            {/* playback bar */}
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
                    className='w-full accent-indigo-500'
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

            {/* modal for spotify codes */}
            {showCode && (
                <div
                    className='fixed inset-0 bg-black/70 flex items-center justify-center z-50'
                    // close when outside clicked
                    onClick={closeModal}>
                    <div
                        className={`bg-gray-900 p-10 rounded-2xl shadow-2xl flex flex-col items-center relative modal-content ${
                            modalVisible ? '' : 'close'
                        }`}
                        // prevent close when clicking inside
                        onClick={(e) => e.stopPropagation()}>
                        {/* "X" button */}
                        <button
                            className='absolute -top-5 -right-5 bg-gray-800 hover:bg-gray-700 rounded-full p-2 shadow-lg'
                            onClick={closeModal}>
                            <XMarkIcon className='w-6 h-6 text-white' />
                        </button>

                        {/* image of spotifycode */}
                        <img
                            src={
                                showCode === 'dark' ? spotifyCodeDark : spotifyCodeLight
                            }
                            alt='Spotify Code'
                            className='w-[28rem] rounded-xl border border-gray-700 mb-4'
                        />

                        {/* attribution */}
                        <p className='text-xs text-gray-500 mb-8'>
                            Generated from{' '}
                            <a
                                href='https://www.spotifycodes.com/'
                                target='_blank'
                                rel='noopener noreferrer'
                                className='underline hover:text-gray-300'>
                                spotifycodes.com
                            </a>
                        </p>

                        {/* open / download buttons */}
                        <div className='flex space-x-6'>
                            <a
                                href={`https://open.spotify.com/track/${track.id}`}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='px-6 py-3 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-sm font-medium'>
                                Open in Spotify
                            </a>
                            <button
                                onClick={() => handleDownload(showCode)}
                                className='flex items-center space-x-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium'>
                                <ArrowDownTrayIcon className='w-5 h-5' />
                                <span>Download</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
