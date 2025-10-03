import React from 'react';

interface StatBoxProps {
    label: string;
    value: string | number;
}

export const StatBox: React.FC<StatBoxProps> = ({ label, value }) => {
    return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 text-center dark:bg-gray-800 dark:border-gray-700">
            <dt className="text-sm font-medium text-gray-500 truncate dark:text-gray-400">{label}</dt>
            <dd className="mt-1 text-2xl font-semibold text-blue-600 dark:text-blue-400">{value}</dd>
        </div>
    );
};