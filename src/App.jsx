import React, { useState } from 'react';
import { useAuth } from './context/useAuth';
import {
    MagnifyingGlassIcon,
    ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/solid';
import SpotifyLogo from './assets/spotify-white-icon.svg';
import PlayPNG from './assets/pause-play.png';

export default function App() {
    const { accessToken, ready, login, logout } = useAuth();

    // search state
    const [searchKey, setSearchKey] = useState('');
    const [tracks, setTracks] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const tracksPerPage = 20;

    // fetch tracks from spotify
    const searchTracks = async (e) => {
        e.preventDefault();
        if (!accessToken) return;

        const params = new URLSearchParams({
            q: searchKey,
            type: 'track',
            limit: 50,
        });

        const res = await fetch(`https://api.spotify.com/v1/search?${params}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!res.ok) throw new Error('Spotify search failed');
        const data = await res.json();
        setTracks(data.tracks.items);
        setCurrentPage(1);
    };

    // pagination
    const indexOfLastTrack = currentPage * tracksPerPage;
    const indexOfFirstTrack = indexOfLastTrack - tracksPerPage;
    const currentTracks = tracks.slice(indexOfFirstTrack, indexOfLastTrack);

    const paginateNext = () => {
        if (indexOfLastTrack < tracks.length) setCurrentPage(currentPage + 1);
    };

    const paginatePrev = () => {
        if (indexOfFirstTrack > 0) setCurrentPage(currentPage - 1);
    };

    if (!ready) return <div>Loading...</div>;

    return (
        <div className='min-h-screen bg-gray-900 text-gray-100'>
            {!accessToken ? (
                <div className='relative flex items-center justify-center min-h-screen bg-black'>
                    {/* mp4 vid background */}
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className='absolute inset-0 w-full h-full object-cover'>
                        <source src='/src/assets/music-bg.mp4' type='video/mp4' />
                    </video>

                    {/* overlay */}
                    <div className='absolute inset-0 bg-black bg-opacity-60'></div>

                    {/* login box */}
                    <div className='relative bg-[#101640]/90 backdrop-blur-md border border-indigo-600/30 shadow-[0_0_20px_rgba(99,102,241,0.3)] rounded-xl p-10 flex flex-col items-center space-y-6 w-full max-w-md'>
                        <img src={PlayPNG} alt='Play' className='w-12 h-12' />

                        <h1 className='text-4xl font-extrabold text-white text-center'>
                            SPOTIFY PLAY
                        </h1>

                        <p className='text-gray-400 text-center'>
                            Search and play your favorite tracks instantly
                        </p>

                        <button
                            className='w-full flex justify-center items-center bg-indigo-500 hover:bg-indigo-600 transition-colors text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:shadow-xl space-x-2'
                            onClick={() => login({ scope: 'user-read-private' })}>
                            <img
                                src={SpotifyLogo}
                                alt='Spotify Logo'
                                className='w-5 h-5'
                            />
                            <span>Login with Spotify</span>
                        </button>
                    </div>
                </div>
            ) : (
                <div className='p-4'>
                    {/* header */}
                    <div className='flex justify-between items-center mb-6'>
                        <div className='flex items-center space-x-2'>
                            <img src={PlayPNG} alt='Play' className='w-6 h-6' />
                            <h2 className='text-2xl font-bold text-white-200'>
                                SPOTIFY PLAY
                            </h2>
                        </div>
                        <button
                            className='bg-red-600 hover:bg-red-700 transition-colors text-gray-100 font-semibold px-4 py-2 rounded-lg shadow hover:shadow-lg flex items-center'
                            onClick={logout}>
                            <ArrowRightOnRectangleIcon className='w-5 h-5 mr-2' />
                            Logout
                        </button>
                    </div>

                    {/* search */}
                    <form
                        onSubmit={searchTracks}
                        className='mb-6 flex space-x-3 relative'>
                        <div className='flex-1 relative'>
                            <input
                                type='text'
                                value={searchKey}
                                onChange={(e) => setSearchKey(e.target.value)}
                                placeholder='What do you want to play?'
                                className='w-full p-3 rounded-lg bg-gray-800 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white-400'
                            />
                            {searchKey && (
                                <button
                                    type='button'
                                    onClick={() => {
                                        setSearchKey('');
                                        setTracks([]);
                                        setCurrentPage(1);
                                    }}
                                    className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 font-bold'>
                                    X
                                </button>
                            )}
                        </div>

                        <button
                            type='submit'
                            className='bg-indigo-500 hover:bg-indigo-600 transition-colors text-gray-100 font-semibold px-4 py-3 rounded-lg shadow hover:shadow-xl flex items-center justify-center'>
                            <MagnifyingGlassIcon className='w-5 h-5' />
                        </button>
                    </form>

                    {/* search results */}
                    <div className='grid lg:grid-cols-5 md:grid-cols-3 sm:grid-cols-2 gap-6'>
                        {currentTracks.map((track) => (
                            <div
                                key={track.id}
                                className='bg-gray-800 rounded-lg overflow-hidden shadow hover:shadow-xl transition-shadow p-4'>
                                {track.album.images[0] && (
                                    <img
                                        src={track.album.images[0].url}
                                        alt={track.name}
                                        className='w-full aspect-square mb-4 rounded'
                                    />
                                )}
                                <p className='text-white text-xl'>{track.name}</p>
                                <p className='text-base text-gray-400 mb-1'>
                                    {track.artists[0].name}
                                </p>
                                {/* <a
                                    href={track.external_urls.spotify}
                                    target='_blank'
                                    className='text-green-500 hover:text-green-400 text-sm font-medium'>
                                    link to spotify
                                </a> */}
                            </div>
                        ))}
                    </div>

                    {/* pagination */}
                    {tracks.length > tracksPerPage && (
                        <div className='flex justify-center items-center mt-4 space-x-4'>
                            {/* prev */}
                            <button
                                onClick={paginatePrev}
                                disabled={currentPage === 1}
                                className='px-4 py-2 rounded-lg bg-gray-700 text-gray-100 hover:bg-gray-600 transition-colors disabled:opacity-50 flex items-center'>
                                ← <span className='ml-2'>Page {currentPage}</span>
                            </button>

                            {/* next */}
                            <button
                                onClick={paginateNext}
                                disabled={indexOfLastTrack >= tracks.length}
                                className='px-4 py-2 rounded-lg bg-gray-700 text-gray-100 hover:bg-gray-600 transition-colors disabled:opacity-50 flex items-center'>
                                <span className='mr-2'>
                                    {Math.ceil(
                                        (tracks.length - indexOfLastTrack) /
                                            tracksPerPage
                                    )}{' '}
                                    left
                                </span>{' '}
                                →
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
