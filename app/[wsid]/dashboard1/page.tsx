"use client";

import React, { useEffect } from "react";
import useSWR from "swr";
import { useRouter, useParams } from "next/navigation";
import {
  Plus,
  MessageCircle,
  Users,
  Sparkles,
  Zap,
  Settings,
} from "lucide-react";

import { Sidebar } from "@/components/Sidebar";
import AutomationModal from "@/components/AutomationModal";
import MaintenanceModal from "@/components/MaintenanceModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const fetcher = async (url: string) => {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) {
    throw new Error("Failed to fetch");
  }
  return res.json();
};

export default function DashboardPage() {
  const router = useRouter();
  const params = useParams();
  const wsid = params.wsid as string;

  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [showAutomationModal, setShowAutomationModal] = React.useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = React.useState(false);

  // ✅ 1. Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me", { credentials: "include" });
        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          router.replace("/");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        router.replace("/");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  // ✅ 2. Fetch workspace user data (includes ownership info)
  const { data: userData, error: userError } = useSWR(
    wsid && isAuthenticated ? `/api/workspaces/${wsid}/user` : null,
    fetcher
  );

  const { data: statsData } = useSWR(
    wsid && isAuthenticated ? `/api/workspaces/${wsid}/stats` : null,
    fetcher,
    { refreshInterval: 10000 }
  );

  // ✅ 3. Redirect if not workspace owner
  useEffect(() => {
    if (!userData && !userError) return; // still loading

    if (userError || userData?.success === false) {
      console.warn("Not authorized for this workspace");
      router.replace("/");
    }
  }, [userData, userError, router]);

  // ✅ 4. Auto-show maintenance modal after login
  useEffect(() => {
    if (isAuthenticated) {
      setShowMaintenanceModal(true);
    }
  }, [isAuthenticated]);

  const user = userData?.user;
  const stats = statsData?.stats || {
    totalAutomations: 0,
    dmsSent: 0,
    totalContacts: 0,
  };

  // ✅ Loading state
  if (isLoading || (!userData && !userError)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-purple-600 mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // ✅ Block non-authenticated users
  if (!isAuthenticated) return null;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 text-gray-900">
      <Sidebar />

      <main className="flex-1 p-4 md:p-8 md:ml-64 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* 👋 Welcome Section */}
          <div className="pt-12 md:pt-0">
            <h2 className="text-2xl md:text-3xl font-bold">
              Hello, {user?.username || "User"}!
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              1 connected account • {stats.totalAutomations} automations
            </p>
          </div>

          {/* 🎯 Main Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Connected */}
            <Card className="rounded-xl shadow-lg bg-white/90 p-6 border-0">
              <p className="text-sm text-gray-600 font-medium">
                Instagram Connection
              </p>
              <h3 className="text-xl font-bold mt-2">Connected</h3>
              <Button
                variant="outline"
                className="mt-4 border-blue-500 text-blue-600 hover:bg-blue-50 bg-transparent"
              >
                Connected
              </Button>
            </Card>

            {/* Create Automation */}
            <Card className="rounded-xl shadow-lg bg-gradient-to-br from-purple-600 to-blue-600 text-white p-6 border-0">
              <p className="text-sm">Create your first Automation</p>
              <h3 className="text-xl font-bold mt-2">Launch Flows Fast</h3>
              <Button
                onClick={() => setShowAutomationModal(true)}
                className="mt-4 bg-white text-purple-600 hover:bg-gray-100"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Automation
              </Button>
            </Card>

            {/* Analytics Shortcut */}
            <Card className="rounded-xl shadow-lg bg-white/90 p-6 border-0">
              <p className="text-sm text-gray-600 font-medium">
                Contacts Overview
              </p>
              <h3 className="text-xl font-bold mt-2">Track Growth</h3>
              <Button
                onClick={() => router.push(`/${wsid}/contacts`)}
                variant="outline"
                className="mt-4 border-purple-500 text-purple-600 hover:bg-purple-50"
              >
                View Stats
              </Button>
            </Card>
          </div>

          {/* 💳 Plans & Billing */}
          <Card className="rounded-xl shadow-lg bg-white border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Settings className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle className="text-lg font-semibold">
                  Plans & Billing
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-2xl font-bold">Free</p>
                  <p className="text-sm text-gray-600">Monthly</p>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  Active
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t">
                <div className="text-center">
                  <div className="flex items-center gap-1 mb-1 justify-center">
                    <Zap className="h-4 w-4 text-purple-600" />
                    <span className="text-xs text-gray-600">Automations</span>
                  </div>
                  <p className="text-sm font-semibold">
                    {stats.totalAutomations} / ∞
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-1 mb-1 justify-center">
                    <MessageCircle className="h-4 w-4 text-blue-600" />
                    <span className="text-xs text-gray-600">Messages</span>
                  </div>
                  <p className="text-sm font-semibold">{stats.dmsSent} / ∞</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-1 mb-1 justify-center">
                    <Users className="h-4 w-4 text-green-600" />
                    <span className="text-xs text-gray-600">Contacts</span>
                  </div>
                  <p className="text-sm font-semibold">{stats.totalContacts} / ∞</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* ✅ Modals */}
      <AutomationModal
        isOpen={showAutomationModal}
        onClose={() => setShowAutomationModal(false)}
      />
    
    </div>
  );
}
