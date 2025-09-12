import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function TrackCard({ track }) {
    const navigate = useNavigate();

    const openTrack = () => {
        navigate('/now-playing', { state: { track } });
    };

    return (
        <div
            onClick={openTrack}
            className='cursor-pointer bg-gray-800 rounded-lg overflow-hidden shadow hover:shadow-xl transition-shadow p-4 hover:bg-gray-700'>
            {track.album.images[0] && (
                <img
                    src={track.album.images[0].url}
                    alt={track.name}
                    className='w-full aspect-square mb-4 rounded'
                />
            )}
            <p className='text-white text-xl'>{track.name}</p>
            <p className='text-base text-gray-400 mb-1'>{track.artists[0].name}</p>
        </div>
    );
}
