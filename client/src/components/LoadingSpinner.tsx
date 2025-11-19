import React from 'react';
import { Spinner } from './ui/spinner';

const LoadingSpinner = () => {
    return (
        <div className="flex items-center gap-2 px-3 py-1 rounded bg-white shadow">
            <p className="text-gray-900">Loading...</p>
            <Spinner />
        </div>
    )
}

export default LoadingSpinner