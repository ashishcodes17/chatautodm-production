"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CheckCircle2 } from "lucide-react"

export default function FeedbackFAB() {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  async function submit() {
    if (!message.trim()) {
      setNotice("Please enter your suggestion.")
      return
    }
    setSubmitting(true)
    setNotice(null)
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }), // workspaceId resolved server-side
      })
      if (!res.ok) throw new Error("Failed to submit")
      setSubmitted(true)
      setMessage("")
      setNotice(null)
    } catch (e) {
      setNotice("Could not submit right now. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="rounded-full shadow-xl">💡 What's Missing?</Button>
        </DialogTrigger>
        <DialogContent className="bg-white/95 backdrop-blur-xl border border-black/5 sm:rounded-3xl">
          {!submitted ? (
            <>
              <DialogHeader>
                <DialogTitle>Got a feature idea?</DialogTitle>
                <DialogDescription>Tell us what would make ChatAutoDM 10x better.</DialogDescription>
              </DialogHeader>
              <div className="mt-2">
                <textarea
                  className="w-full p-4 rounded-2xl border border-gray-200 bg-white/80 focus:bg-white outline-none focus:ring-2 focus:ring-black/10 min-h-[140px]"
                  placeholder="Describe what you want to achieve, and how this feature helps..."
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
              {notice && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 text-amber-900 px-3 py-2 text-sm">
                  {notice}
                </div>
              )}
              <div className="mt-2 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setOpen(false)} className="rounded-full">
                  Close
                </Button>
                <Button onClick={submit} disabled={submitting} className="rounded-full">
                  {submitting ? "Submitting..." : "Submit"}
                </Button>
              </div>
            </>
          ) : (
            <div className="px-1 py-2">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-200 to-emerald-100 blur-xl opacity-60" />
                  <CheckCircle2 className="relative h-14 w-14 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold">Thank you for the response</h3>
                <p className="text-sm text-gray-600">have a gooood day :)</p>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setOpen(false)} className="rounded-full">
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setSubmitted(false)
                    setNotice(null)
                    setMessage("")
                  }}
                  className="rounded-full"
                >
                  Submit another
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
