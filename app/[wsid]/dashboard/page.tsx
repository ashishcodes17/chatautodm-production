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

import AutomationModal from "@/components/AutomationModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MinimalBanner from "@/components/MinimalBanner";
import FeedbackFAB from "@/components/feedback-fab"

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

  const [showAutomationModal, setShowAutomationModal] = React.useState(false);

  // ✅ Use cached data from layout (no duplicate fetching)
  const { data: userData, error: userError } = useSWR(
    `/api/workspaces/${wsid}/user`,
    fetcher,
    { revalidateOnMount: false } // Use cache from layout
  );

  const { data: statsData } = useSWR(
    `/api/workspaces/${wsid}/stats`,
    fetcher,
    { revalidateOnMount: false } // Use cache from layout
  );

  const user = userData?.user;
  const stats = statsData?.stats || {
    totalAutomations: 0,
    dmsSent: 0,
    totalContacts: 0,
  };

  // ✅ Loading state (only show if no cached data)
  if (!userData && !userError) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-purple-600 mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 text-gray-900">

      <main className="p-4 md:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* 👋 Welcome */}
          <div className="pt-12 md:pt-0">
            <h2 className="text-2xl md:text-3xl font-bold">Hello, {user?.username || "User"}!</h2>
            <p className="text-sm text-gray-600 mt-1">
              1 connected account • {stats.totalAutomations} automations{" "}
            </p>
          </div>

          {/* 🎯 Main Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Connected */}
            <Card className="rounded-xl shadow-lg bg-white/90 p-6 border-0">
              <p className="text-sm text-gray-600 font-medium">Instagram Connection</p>
              <h3 className="text-xl font-bold mt-2">Connected</h3>
              <Button variant="outline" className="mt-4 border-blue-500 text-blue-600 hover:bg-blue-50 bg-transparent">
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
              <p className="text-sm text-gray-600 font-medium">Contacts Overview</p>
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

          {/* Other existing content ... */}
          {/* (kept exactly as in your code) */}
             {/* 📈 Usage Widget */}
         {/* <UsageWidget userId={wsid} />*/}
           
{/*
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         
          
            {/* Conversion Funnel Card */}
             {/*
            <Card className="rounded-xl shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50 border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                  </div>
                  <CardTitle className="text-lg font-semibold">Conversion Funnel</CardTitle>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  Last 7 days
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">Messages</p>
                    <p className="text-3xl font-bold">{stats.dmsSent || 0}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">Seen</p>
                    <p className="text-3xl font-bold">{stats.messagesSeen || 0}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">Pressed</p>
                    <p className="text-3xl font-bold">{stats.messagesPressed || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
           
 
            {/* Growth Card */}
            {/*
            <Card className="rounded-xl shadow-lg bg-white border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <CardTitle className="text-lg font-semibold">Growth</CardTitle>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  Last 7 days
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">New Followers</span>
                    </div>
                    <span className="text-2xl font-bold">{stats.newFollowers || 0}</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {stats.newFollowers > 0 ? `Followers gained through Zorcha` : "No follower data available"}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium">Messages</span>
                    </div>
                    <span className="text-2xl font-bold">{stats.dmsSent || 0}</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {stats.dmsSent > 0 ? `Total automated messages sent` : "No message data available"}
                  </p>
                </div>
              </CardContent>
            </Card>
              
          </div>
          
*/}

          <Card className="rounded-xl shadow-lg bg-white border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Settings className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle className="text-lg font-semibold">Plans & Billing</CardTitle>
              </div>
              {/*
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Manage
              </Button>
              */}
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-2xl font-bold capitalize">{user?.plan || 'Freeby'}</p>
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
                  <p className="text-sm font-semibold">{stats.totalAutomations} / ∞</p>
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

          {/* 💡 Popular Automations */}
          <Card className="border-0 rounded-xl shadow-lg bg-white/90">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                Popular Automations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Comment to DM */}
                <Card
                  onClick={() => router.push(`/${wsid}/automations/flow-builder`)}
                  className="cursor-pointer border-2 border-purple-200 hover:border-purple-400 transition-all duration-200"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl">
                        <MessageCircle className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold">Comment to DM Flow</h4>
                        <p className="text-sm text-gray-600">Auto-reply to comments with DMs</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* DM Auto Responder */}
                <Card
                  onClick={() => router.push(`/${wsid}/automations/story-builder`)}
                  className="cursor-pointer border-2 border-green-200 hover:border-green-400 transition-all duration-200"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl">
                        <Zap className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold">Story Reply Flow</h4>
                        <p className="text-sm text-gray-600">Respond to DMs with options</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
          {/*

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="rounded-xl shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 border-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Total DMs</p>
                    <p className="text-2xl font-bold text-blue-700">{stats.dmsSent}</p>
                  </div>
                  <MessageCircle className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl shadow-lg bg-gradient-to-br from-green-50 to-green-100 border-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 font-medium">Active Automations</p>
                    <p className="text-2xl font-bold text-green-700">{stats.activeAutomations}</p>
                  </div>
                  <Zap className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 border-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600 font-medium">Total Contacts</p>
                    <p className="text-2xl font-bold text-purple-700">{stats.totalContacts}</p>
                  </div>
                  <Users className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl shadow-lg bg-gradient-to-br from-orange-50 to-orange-100 border-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-orange-600 font-medium">Conversion Rate</p>
                    <p className="text-2xl font-bold text-orange-700">{stats.conversionRate}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
           
          </div>
          */}
         

        </div>
         <MinimalBanner />
         <FeedbackFAB />
      </main>

      {/* ✅ Existing Automation Modal */}
      <AutomationModal isOpen={showAutomationModal} onClose={() => setShowAutomationModal(false)} />

      {/* ✅ New Maintenance Modal */}
      {/* <MaintenanceModal isOpen={showMaintenanceModal} onClose={() => setShowMaintenanceModal(false)} /> */}
      
    </div>
  )
}
