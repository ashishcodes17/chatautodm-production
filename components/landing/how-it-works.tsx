import { ArrowRight, CheckCircle2, MessageSquare, Send, Settings } from "lucide-react"

export function HowItWorks() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-background relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-grid-small-white/[0.2] -z-10" />
      <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-pink-500/10 blur-3xl -z-10" />
      <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-purple-500/10 blur-3xl -z-10" />

      <div className="container px-4 md:px-6 relative z-10">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-flex items-center rounded-full border border-pink-200/30 bg-pink-50/50 px-3 py-1 text-sm text-pink-600 backdrop-blur-md dark:border-pink-500/20 dark:bg-pink-500/10 dark:text-pink-300">
              <span className="mr-2 rounded-full bg-pink-600 h-2 w-2"></span>
              Simple Process
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Set Up in Minutes, Run on Autopilot
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Automate your Instagram DMs in three simple steps
            </p>
          </div>
        </div>

        <div className="mx-auto grid max-w-5xl grid-cols-1 md:grid-cols-3 gap-8 mt-16 relative">
          {/* Connection line */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-pink-500 to-purple-600 transform -translate-y-1/2 z-0"></div>

          <div className="relative flex flex-col items-center text-center z-10 bg-background/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-pink-100 dark:border-pink-900/30">
            <div className="absolute -top-6 w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-lg">
              1
            </div>
            <div className="rounded-full bg-pink-100 dark:bg-pink-900/30 p-4 mb-6 mt-4">
              <Settings className="h-8 w-8 text-pink-600 dark:text-pink-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">Connect Instagram</h3>
            <p className="text-muted-foreground mb-6">Link your Instagram Business account with just a few clicks</p>

            <div className="mt-auto space-y-3 text-left w-full">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm">Secure OAuth authentication</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm">Works with Business accounts</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm">No password storage</p>
              </div>
            </div>
          </div>

          <div className="relative flex flex-col items-center text-center z-10 bg-background/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-purple-100 dark:border-purple-900/30">
            <div className="absolute -top-6 w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-lg">
              2
            </div>
            <div className="rounded-full bg-purple-100 dark:bg-purple-900/30 p-4 mb-6 mt-4">
              <MessageSquare className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">Set Up Triggers</h3>
            <p className="text-muted-foreground mb-6">
              Choose posts and define keyword triggers for automated responses
            </p>

            <div className="mt-auto space-y-3 text-left w-full">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm">Select any of your posts</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm">Define custom keywords</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm">Create personalized messages</p>
              </div>
            </div>
          </div>

          <div className="relative flex flex-col items-center text-center z-10 bg-background/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-amber-100 dark:border-amber-900/30">
            <div className="absolute -top-6 w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-lg">
              3
            </div>
            <div className="rounded-full bg-amber-100 dark:bg-amber-900/30 p-4 mb-6 mt-4">
              <Send className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">Automate & Analyze</h3>
            <p className="text-muted-foreground mb-6">Let our system handle the rest while you track performance</p>

            <div className="mt-auto space-y-3 text-left w-full">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm">Automatic comment monitoring</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm">Instant DM delivery</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm">Detailed performance analytics</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="flex justify-center mt-16">
          <a
            href="/signup"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-3 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            Get Started Now
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  )
}
