export default function Home() {
  return (
    <div
      className="
        min-h-screen
        bg-[radial-gradient(160%_120%_at_50%_20%,_rgba(48,118,253,0.30),_rgba(48,118,253,0.13),_transparent)]
        from-white
        to-white
        flex
        flex-col
      "
    >

      {/* NAV */}
      <header className="w-full px-8 py-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">ChatAutoDM</h1>
        <button className="px-5 py-2 rounded-full bg-black text-white shadow">
          Login
        </button>
      </header>

      {/* HERO */}
      <section className="flex flex-col items-center text-center mt-10 px-4">
        <span className="px-4 py-1 text-sm bg-black text-white rounded-full mb-6">
          NEW • AI Instagram Automation
        </span>

        <h1 className="text-7xl font-black text-gray-950 leading-tight max-w-4xl">
          Engage customers instantly with <br /> just a message.
        </h1>

        <p className="text-lg text-gray-800 mt-6 max-w-2xl">
          Automate replies, boost conversions, and grow your Instagram presence — effortlessly.
        </p>

        <button
  className="
    group
    relative
    flex 
    items-center 
    gap-4
    px-12 
    py-2.5 
    mt-8
    rounded-full 
    text-white 
    font-semibold 
    text-xl
    border 
    border-[#2a63d9]/50

    bg-[linear-gradient(to_bottom,_#3076fd,_#4d7dff,_#6ea0ff)]
    // shadow-[0_8px_30px_rgba(48,118,253,0.45)]
    shadow-lg
    hover:shadow-[0_12px_36px_rgba(48,118,253,0.55)]
    transition-all 
    duration-200 
    hover:scale-[1.03]
  "
>
  Get Started • it's free

  {/* <span
    className="
      flex 
      items-center 
      justify-center 
      h-12 
      w-12 
      rounded-full 
      bg-white 
      text-black 
      shadow-md
      transition-transform
      duration-200
      group-hover:translate-x-1
    "
  >
    →
  </span> */}
</button>


      </section>

    </div>
  )
}
