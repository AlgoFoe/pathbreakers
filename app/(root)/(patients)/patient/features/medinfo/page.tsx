'use client'

import { Pill } from 'lucide-react'

export default function MedInfo() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-teal-100 to-blue-200">
      <header className=" hidden lg:block lg:sticky fixed top-16 sm:top-16 md:top-16 lg:top-0 z-10 w-full bg-lblue bg-opacity-20 backdrop-filter backdrop-blur-lg shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
            <div className="bg-lblue bg-opacity-50 rounded-lg p-2">
                <Pill className="text-blue w-8 h-8" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-green-800">MedInfo</h1>
                <p className="hidden lg:block text-2xl sm:text-3xl lg:text-3xl font-bold text-blue ml-0 sm:ml-2 leading-6 sm:leading-6">Your Health, Your Knowledge</p>
              </div>
            </div>
          </div>
        </div>
      </header>

    </div>
  )
}

