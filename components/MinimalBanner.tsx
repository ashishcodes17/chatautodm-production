"use client";

import { useEffect, useState } from "react";

export default function MinimalBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 1000); // show after 2s
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!show) return;
    const autoHide = setTimeout(() => setShow(false), 10000); // auto-hide 10s
    return () => clearTimeout(autoHide);
  }, [show]);

  if (!show) return null;

  return (
    <div className="fixed bottom-20 right-6 z-50 max-w-xs bg-white dark:bg-gray-900/95 backdrop-blur-md shadow-lg rounded-xl p-4 animate-slide-in">
      <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">
        Love what we’re building? Please share with your fellow creators and help us grow!
      </p>
    </div>
  );
}
