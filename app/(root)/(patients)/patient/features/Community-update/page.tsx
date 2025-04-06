'use client'
import { MessageSquarePlus as B } from "lucide-react";

interface Cardtype {
  username: string;
  tag: string;
  content: string;
  date: string;
  img: string;
  desc: string;
}

const Page = () => {
  return (
    <div>
      <header className="lg:sticky fixed top-16 sm:top-16 md:top-16 lg:top-0 z-10 w-full bg-lblue bg-opacity-20 backdrop-filter backdrop-blur-lg shadow-lg">
        <div className="container mx-auto px-4 py-2">
          <div className="flex gap-2 items-center justify-between ">
            <div className="flex items-center gap-1">
              <div className="bg-lblue bg-opacity-50 rounded-lg p-2">
                <B className="text-blue w-8 h-8" aria-hidden="true" />
              </div>
              <div className="flex flex-col">
                <h1 className="hidden lg:block text-2xl sm:text-3xl lg:text-3xl font-bold text-blue ml-0 sm:ml-2 leading-6 sm:leading-6">
                  Announcements
                </h1>
                <p className="hidden lg:block text-blue-700 text-sm sm:text-base ml-0 sm:ml-2">
                  Stay updated with the latest hospital announcements
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>
      
    </div>
  )
}

export default Page;