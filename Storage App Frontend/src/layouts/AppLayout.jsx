import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const AppLayout = () => {
    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Header */}
                <Header />

                {/* Page Content */}
                <main className="flex-1 overflow-auto p-6 scroll-smooth">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AppLayout;
