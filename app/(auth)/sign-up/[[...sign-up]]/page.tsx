"use client";
    
import { SignUp } from '@clerk/nextjs';
import Image from "next/image";
import { useRouter } from 'next/navigation';

const SignUpPage = () => {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <div className="sm:flex hidden flex-1 bg-white text-black flex-col justify-center px-8 lg:px-16 py-12 relative">
        <div className="max-w-lg mx-auto">
          <Image
            src="/assets/images/large-logo.png"
            alt="PathBreakers Logo"
            width={300}
            height={300}
            className="-translate-x-28 bg-white bg-opacity-25 p-1 rounded-lg cursor-pointer"
            onClick={() => router.push('/')}
          />
          <h1 className="text-4xl lg:text-5xl font-extrabold mb-4">PathBreakers Sign Up</h1>
          <p className="text-lg mb-6">
            PathBreakers
          </p>
          <p className="text-sm opacity-80">
            PathBreakers
          </p>
        </div>
      </div>
      <div className="flex-1 bg-inherit flex items-center justify-center px-6 py-6 lg:px-16">
        <div className="flex-col">
          <SignUp
            appearance={{
              variables: {
                colorPrimary: "#171b1c",
              },
              elements: {
                formButtonPrimary: "bg-black",
                formFieldInput: "border-gray-300 focus:ring-blue",
                headerTitle: "text-black",
              },
            }}
            fallbackRedirectUrl={"/"}
            forceRedirectUrl={"/"}
          />
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;