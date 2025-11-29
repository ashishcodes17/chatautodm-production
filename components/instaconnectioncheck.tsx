"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Instagram } from "lucide-react";

interface IGReconnectModalProps {
  open: boolean;
  onReconnect: () => void;
}

export default function IGReconnectModal({ open }: IGReconnectModalProps) {
  const [connecting, setConnecting] = useState(false);

  const handleInstagramConnect = async () => {
    setConnecting(true);

    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      const token = data.token;

      const redirectUri = encodeURIComponent(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/instagram/callback`
      );

      const instagramAuthUrl = `https://www.instagram.com/oauth/authorize?client_id=${
        process.env.NEXT_PUBLIC_INSTAGRAM_APP_ID
      }&redirect_uri=${redirectUri}&response_type=code&scope=instagram_business_basic,instagram_business_manage_comments,instagram_business_manage_messages,instagram_business_manage_insights&state=${token}`;

      window.location.href = instagramAuthUrl;
    } catch (error) {
      console.error("Error connecting Instagram:", error);
      setConnecting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="
            fixed inset-0 z-[999]
            flex items-center justify-center
            backdrop-blur-xl bg-black/20
            p-4
          "
        >
          <motion.div
            initial={{ y: 20, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="
              max-w-md w-full rounded-3xl
              shadow-[0_8px_30px_rgba(0,0,0,0.12)]
              overflow-hidden
            "
          >
            {/* Header */}
            <div className="bg-gradient-to-br from-[#E9D5FF] via-[#C084FC] to-[#F9A8D4] p-8">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto shadow-lg">
                <Instagram className="text-white w-8 h-8" />
              </div>

              <h2 className="mt-6 text-center text-2xl font-semibold text-white tracking-tight">
                Instagram Connection Lost
              </h2>

              <p className="text-center text-white/80 mt-2 text-sm leading-relaxed">
                Your Instagram session expired or permissions were removed.
              </p>
            </div>

            {/* Body */}
            <div className="bg-white p-8">
              <div className="flex justify-center">
                <button
                  onClick={handleInstagramConnect}
                  disabled={connecting}
                  className="
                    group relative flex items-center justify-between gap-6
                    px-12 py-5 rounded-[3.2rem]
                    font-semibold text-xl text-white
                    transition-all duration-300 ease-out
                    bg-[linear-gradient(to_bottom,#5A3BFF_0%,#634BFF_35%,#7C6BFF_100%)]
                    shadow-[0_18px_60px_rgba(100,70,255,0.45)]
                    hover:shadow-[0_25px_75px_rgba(100,70,255,0.55)]
                    hover:scale-[1.035]
                    disabled:opacity-60 disabled:cursor-not-allowed
                  "
                >
                  {/* Glossy reflection */}
                  <div
                    className="
                      pointer-events-none absolute inset-0 rounded-[3.2rem]
                      bg-[linear-gradient(to_bottom,rgba(255,255,255,0.25),rgba(255,255,255,0)_60%)]
                    "
                  ></div>

                  <span className="relative z-10">
                    {connecting ? "Connecting..." : "Reconnect Instagram"}
                  </span>
                </button>
              </div>

              <p className="text-xs text-gray-400 text-center mt-4">
                Your automations remain safe — they’ll continue once reconnected.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
