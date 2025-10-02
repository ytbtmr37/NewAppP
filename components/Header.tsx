
import React from 'react';

export const Header: React.FC = () => {
    return (
        <header className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-cyan-400">
                مصمم الصفحات الفوري
            </h1>
            <p className="mt-4 text-lg text-gray-400 max-w-3xl mx-auto">
                حوّل النص العادي إلى صفحة HTML أنيقة ومنسقة تلقائيًا. الصق المحتوى الخاص بك وشاهد الإبداع.
            </p>
        </header>
    );
};
