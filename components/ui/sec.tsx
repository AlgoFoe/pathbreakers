"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import TrueFocus from "../shared/TrueFocus";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const Sec1 = () => {
  const router = useRouter();
  return (
    <div className="w-full flex flex-col md:flex-row justify-center items-start md:items-center gap-10 md:pl-16">
      <div className="flex gap-2 flex-col items-start justify-center self-start ml-7 md:ml-4 lg:ml-12 md:mt-16 md:basis-[48%]">
          <div className="text-black font-bold tracking-wide text-4xl md:text-6xl leading-tight mb-4 pointer-events-none mt-4 lg:mt-0">
            <span className="whitespace-nowrap font-bold text-3xl md:text-6xl block md:pl-0 pl-2 text-center w-full">
              <span className="hidden md:inline">
                Break The Traditional Path
              </span>
              <span className="inline md:hidden">
                Break The Traditional<br />Path
              </span>
            </span>
          </div>
          <span className="text-indigo-600 text-2xl font-normal">
            <TrueFocus
              sentence="Build Careers"
              manualMode={false}
              blurAmount={5}
              borderColor="black"
              animationDuration={1.5}
              pauseBetweenAnimations={1}
            />
          </span>
        <p className="mt-1 text-black font-semibold text-lg md:text-xl lg:text-2xl">
          Say goodbye to overwhelming career decisions and hello to
          PathBreakers—where we simplify your career and college choices with
          clarity and insight. Join the ranks of the top achievers who
          confidently navigate their futures with ease and precision
        </p>
        <Button
          type="button"
          className="mt-10 text-3xl py-6"
          onClick={() => {
            router.push("/dashboard");
          }}
        >
          Transform your life
        </Button>
      </div>

      <div className="flex flex-col items-center justify-center self-center h-full w-full md:basis-[52%] max-h-40px -translate-y-8">
        <motion.div
          whileHover={{ scale: 1.1 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <Image
            src="/assets/images/main.png"
            alt="logo"
            width={350}
            height={200}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default Sec1;
