export function FunnelSection() {
  return (
    <section className="w-full py-20 bg-white text-black">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center mb-4">
            <span className="text-orange-500 text-4xl">✨</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold max-w-5xl mx-auto">
            From simple welcome messages to optimized sales & marketing funnels
          </h2>
          <p className="text-xl text-zinc-600 mt-6 max-w-3xl mx-auto">
            Go live in minutes with templates or go deep with our visual Flow Builder.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
          <div className="bg-[#3B5BDB] text-white p-8 rounded-xl">
            <h3 className="text-2xl font-bold mb-4">Ready-to-use templates</h3>
            <p className="text-zinc-200 mb-6">
              Get started in minutes with our pre-built automation templates for every use case.
            </p>
            <a href="#" className="inline-block bg-white text-[#3B5BDB] px-6 py-3 rounded-full font-medium">
              Browse Templates
            </a>
          </div>

          <div className="bg-[#F8E4FF] p-8 rounded-xl">
            <h3 className="text-2xl font-bold mb-4">Grow your Followers & Contacts</h3>
            <p className="text-zinc-700 mb-6">
              Never miss a chance to grow—automatically ask users to follow and watch your community expand.
            </p>
            <a href="#" className="inline-block bg-black text-white px-6 py-3 rounded-full font-medium">
              Get Started!
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
