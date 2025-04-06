'use client'
import { Bed as B } from "lucide-react";

const Bed = () => {

  return (
    <div >
      <header className="lg:sticky fixed top-16 sm:top-16 md:top-16 lg:top-0 z-10 w-full bg-lblue bg-opacity-20 backdrop-filter backdrop-blur-lg shadow-lg">
        <div className="container mx-auto px-4 py-2">
          <div className="flex flex-row gap-2 items-center justify-between ">
            <div className="flex items-center gap-1">
              <div className="bg-lblue bg-opacity-50 rounded-lg p-2">
                <B className="text-blue w-8 h-8" aria-hidden="true" />
              </div>
              <div className="flex flex-col">
                <h1 className="hidden lg:block text-2xl sm:text-3xl lg:text-3xl font-bold text-blue ml-0 sm:ml-2 leading-6 sm:leading-6">
                  Hospital Beds Status
                </h1>
                <p className="hidden lg:block text-blue-700 text-sm sm:text-base ml-0 sm:ml-2">
                  Check the availability of beds in the hospital
                </p>
              </div>
            </div>
            <div className="flex flex-row justify-end item-center gap-3 font-semibold text-lg  text-white">
                <div className='bg-gradient-to-b from-[#00F7DB] to-[#00D944] h-5 w-5 rounded-3xl self-center'></div>Empty
                <div className='bg-gradient-to-b from-[#FFE33F] to-[#FF9933] h-5 w-5 rounded-3xl self-center'></div>Occupied
              </div>
          </div>
        </div>
      </header>
    </div>
  );
}

export default Bed;