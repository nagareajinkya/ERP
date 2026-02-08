import React from 'react';

/**
 * DashboardSkeleton Component
 * Loading state UI that matches dashboard layout structure
 * Prevents layout shift and provides visual feedback during data fetch
 */
const DashboardSkeleton = () => {
    return (
        <div className="min-h-screen bg-gray-50/50 p-6 font-sans">
            {/* Header Skeleton */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <div className="h-8 w-32 bg-gray-200 rounded-lg mb-2 animate-pulse"></div>
                    <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="flex gap-3">
                    <div className="h-10 w-32 bg-gray-200 rounded-xl animate-pulse"></div>
                    <div className="h-10 w-32 bg-gray-200 rounded-xl animate-pulse"></div>
                </div>
            </div>

            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm animate-pulse">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
                            <div className="flex-1">
                                <div className="h-3 w-24 bg-gray-200 rounded mb-2"></div>
                                <div className="h-8 w-20 bg-gray-200 rounded"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Grid Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Chart Skeleton */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <div className="h-6 w-32 bg-gray-200 rounded mb-2 animate-pulse"></div>
                            <div className="h-3 w-48 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                        <div className="h-8 w-40 bg-gray-200 rounded-lg animate-pulse"></div>
                    </div>
                    <div className="h-[300px] bg-gray-100 rounded-lg animate-pulse"></div>
                </div>

                {/* Low Stock Panel Skeleton */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="p-3 bg-gray-50 rounded-xl animate-pulse">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                                        <div>
                                            <div className="h-4 w-24 bg-gray-200 rounded mb-1"></div>
                                            <div className="h-3 w-16 bg-gray-200 rounded"></div>
                                        </div>
                                    </div>
                                    <div className="h-8 w-16 bg-gray-200 rounded-lg"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Transactions Table Skeleton */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <div className="h-6 w-40 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="flex justify-between items-center py-4 border-b border-gray-50">
                            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                            <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"></div>
                            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                            <div className="h-6 w-16 bg-gray-200 rounded-md animate-pulse"></div>
                            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DashboardSkeleton;
