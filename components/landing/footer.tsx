import Link from "next/link"
import { Instagram, Twitter, Facebook, Linkedin, Youtube } from "lucide-react"

export function Footer() {
  return (
    <footer className="w-full bg-black text-white py-16">
      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-6">
               <img
                src="/favicon.png"
                alt="Instagram"
                className="h-6 w-6 object-contain rounded-md"
                />

              <span className="text-xl font-bold">ChatAutoDM</span>
            </Link>
            <p className="text-zinc-400 max-w-xs mb-6">
              Automate Instagram DMs when users comment specific keywords on your posts. Boost engagement, deliver
              resources, and grow your audience on autopilot.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-zinc-400 hover:text-white">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-zinc-400 hover:text-white">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-zinc-400 hover:text-white">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-zinc-400 hover:text-white">
                <Linkedin className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-zinc-400 hover:text-white">
                <Youtube className="h-5 w-5" />
              </Link>
            </div>
          </div>
          

          <div>
            <h3 className="text-lg font-bold mb-4">Compare</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/compare/manychat" className="text-zinc-400 hover:text-white">
                  ManyChat
                </Link>
              </li>
              <li>
                <Link href="/compare/linkdm" className="text-zinc-400 hover:text-white">
                  LinkDM
                </Link>
              </li>
              <li>
                <Link href="/compare/zorcha" className="text-zinc-400 hover:text-white">
                  Zorcha
                </Link>
              </li>
              <li>
                <Link href="/compare/chatfuel" className="text-zinc-400 hover:text-white">
                  ChatFuel
                </Link>
              </li>
          
            </ul>
          </div>
         

          <div>
            <h3 className="text-lg font-bold mb-4">ChatAutoDM</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-zinc-400 hover:text-white">
                  About
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-zinc-400 hover:text-white">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-zinc-400 hover:text-white">
                  Pricing
                </Link>
                
              </li>
              <li>
                 <Link
      href="https://www.instagram.com/direct/t/17845981776481974/"
      target="_blank"
      className="text-zinc-400 hover:text-white"
    >           Conatct
                   </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Resources</h3>
            <ul className="space-y-2">
            {/*
              <li>
                <Link href="#" className="text-zinc-400 hover:text-white">
                  Help center
                </Link>
              </li>
              <li>
                <Link href="#" className="text-zinc-400 hover:text-white">
                  Community
                </Link>
              </li>
              <li>
                <Link href="#" className="text-zinc-400 hover:text-white">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="text-zinc-400 hover:text-white">
                  Chronically online
                </Link>
              </li>
              <li>
                <Link href="#" className="text-zinc-400 hover:text-white">
                  How to
                </Link>
              </li>
              */}
              <li>
                <Link href="/privacy" className="text-zinc-400 hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-zinc-400 hover:text-white">
                  Terms of Service
                </Link>
              </li>
               <li>
                <Link href="https://chatautodm.instatus.com/" className="text-zinc-400 hover:text-white">
                  Status Page
                </Link>
              </li>
              <li>
                <Link href="/meta-verified" className="text-zinc-400 hover:text-white">
                  Meta-Verified
                </Link>
              </li> 
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-zinc-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-zinc-500 text-sm">© 2025, ChatAutoDM, Inc.</p>

          <div className="flex space-x-6 mt-4 md:mt-1">
          {/*
            <Link href="#" className="text-zinc-500 hover:text-white text-sm">
              Status page
            </Link>
            <Link href="#" className="text-zinc-500 hover:text-white text-sm">
              Changelog
            </Link>
            <Link href="#" className="text-zinc-500 hover:text-white text-sm">
              Privacy settings
            </Link>
            */}
            {/* <Link href="/privacy" className="text-zinc-500 hover:text-white text-sm">
              Privacy policy
            </Link>
            <Link href="/terms" className="text-zinc-500 hover:text-white text-sm">
              Terms of service
            </Link> */}
          </div>
          
        </div>
       
      </div>
       <h1 className="font-extrabold text-[#DEE0FF] leading-none text-center"
          style={{ fontSize: "16vw", whiteSpace: "nowrap" }}>
        chatautodm
      </h1>
    </footer>
  )
}
