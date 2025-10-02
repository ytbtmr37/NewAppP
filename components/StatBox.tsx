import React from 'react';

interface StatBoxProps {
    label: string;
    value: string | number;
}

export const StatBox: React.FC<StatBoxProps> = ({ label, value }) => {
    return (
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3 text-center">
            <dt className="text-sm font-medium text-gray-400 truncate">{label}</dt>
            <dd className="mt-1 text-2xl font-semibold text-cyan-400">{value}</dd>
        </div>
    );
};
