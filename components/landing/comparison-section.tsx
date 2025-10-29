export function ComparisonSection() {
  return (
    <section className="w-full py-20 bg-white text-black">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center mb-4">
            <span className="text-orange-500 text-4xl">👀</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold max-w-5xl mx-auto">Your inbox: a before & after</h2>
          <p className="text-xl text-zinc-600 mt-6 max-w-3xl mx-auto">More messages, less mess.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-16">
          <div className="bg-zinc-100 p-8 rounded-xl">
            <h3 className="text-2xl font-bold mb-4">Before ChatAutoDM</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="text-red-500 text-xl">❌</span>
                <p>Manually responding to every comment and DM</p>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-500 text-xl">❌</span>
                <p>Missing potential leads while you sleep</p>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-500 text-xl">❌</span>
                <p>No way to track engagement or conversions</p>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-500 text-xl">❌</span>
                <p>Hours spent on repetitive messaging tasks</p>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-500 text-xl">❌</span>
                <p>Inconsistent response times and messaging</p>
              </li>
            </ul>
          </div>

          <div className="bg-[#F8E4FF] p-8 rounded-xl">
            <h3 className="text-2xl font-bold mb-4">After ChatAutoDM</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="text-green-500 text-xl">✅</span>
                <p>Automated responses to comments and DMs 24/7</p>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500 text-xl">✅</span>
                <p>Capture leads while you sleep with instant responses</p>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500 text-xl">✅</span>
                <p>Detailed analytics on engagement and conversions</p>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500 text-xl">✅</span>
                <p>Save 20+ hours per week with automation</p>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500 text-xl">✅</span>
                <p>Consistent, on-brand messaging at all times</p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
