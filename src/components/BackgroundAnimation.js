'use client';

import dynamic from 'next/dynamic';

// Dynamically import Three.js component to avoid SSR issues
const ThreeJSBackground = dynamic(() => import('./ThreeJSBackground'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Fallback gradient orbs while loading */}
      <div className="absolute top-0 -left-1/4 w-96 h-96 bg-sky_blue-400/30 dark:bg-sky_blue-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute top-1/3 -right-1/4 w-96 h-96 bg-steel_blue-400/30 dark:bg-steel_blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-cream-400/30 dark:bg-cream-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
    </div>
  ),
});

export default function BackgroundAnimation() {
  return (
    <>
      <ThreeJSBackground />
      {/* Additional gradient overlay for depth */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-1/4 w-96 h-96 bg-sky_blue-400/10 dark:bg-sky_blue-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 -right-1/4 w-96 h-96 bg-steel_blue-400/10 dark:bg-steel_blue-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-cream-400/10 dark:bg-cream-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>
    </>
  );
}
