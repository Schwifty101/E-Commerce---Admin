import React from 'react';
import { Route, Routes, NavLink } from 'react-router-dom';
import clsx from 'clsx';
import Overview from '../components/analytics/Overview';
import RevenueAnalytics from '../components/analytics/RevenueAnalytics';
import UserActivity from '../components/analytics/UserActivity';
import TopProducts from '../components/analytics/TopProducts';
import ExportAnalytics from '../components/analytics/ExportAnalytics';
import { ChevronRight } from 'lucide-react';

const Analytics = () => {
    const navLinks = [
        { path: '', label: 'Overview', component: Overview },
        { path: 'revenue', label: 'Revenue Analytics', component: RevenueAnalytics },
        { path: 'user-activity', label: 'User Activity', component: UserActivity },
        { path: 'top-products', label: 'Top Products', component: TopProducts },
        { path: 'export', label: 'Export Data', component: ExportAnalytics },
    ];

    const isActive = (path) => {
        const currentPath = window.location.pathname;
        if (path === '') {
            return currentPath === '/analytics' || currentPath === '/analytics/';
        }
        return currentPath === `/analytics/${path}`;
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header - Enhanced responsive styling */}
            <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
                <div className="container mx-auto px-4 sm:px-6 py-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                        <div className="flex items-center space-x-2">
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
                            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                            <span className="text-gray-500 text-xs sm:text-sm">Real-time insights</span>
                        </div>

                        {/* Enhanced Navigation */}
                        <nav className="flex-shrink-0">
                            <ul className="flex flex-wrap gap-2 -mx-1">
                                {navLinks.map((link) => (
                                    <li key={link.path} className="px-1">
                                        <NavLink
                                            to={`/analytics/${link.path}`}
                                            end={link.path === ''}
                                            className={({ isActive: routerIsActive }) => clsx(
                                                "px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200",
                                                "hover:bg-blue-50 hover:text-blue-600 active:scale-95",
                                                "flex items-center space-x-2",
                                                isActive(link.path)
                                                    ? "bg-blue-50 text-blue-600 shadow-sm ring-2 ring-blue-100"
                                                    : "text-gray-600 hover:shadow-sm"
                                            )}
                                        >
                                            {link.label}
                                        </NavLink>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    </div>
                </div>
            </header>

            {/* Main Content - Enhanced styling */}
            <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-grow">
                <div className="bg-white rounded-xl shadow-sm border transition-shadow hover:shadow-md">
                    <Routes>
                        {navLinks.map((link) => (
                            <Route
                                key={link.path}
                                path={link.path}
                                element={
                                    <div className="p-4 sm:p-6">
                                        <link.component />
                                    </div>
                                }
                            />
                        ))}
                    </Routes>
                </div>
            </main>

            {/* Footer - Enhanced styling */}
            <footer className="bg-white border-t mt-auto">
                <div className="container mx-auto px-4 sm:px-6 py-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
                        <p className="text-xs sm:text-sm text-gray-500">
                            &copy; {new Date().getFullYear()} Analytics Dashboard
                        </p>
                        <p className="text-xs sm:text-sm text-gray-400">
                            Last updated: {new Date().toLocaleTimeString()}
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Analytics;
