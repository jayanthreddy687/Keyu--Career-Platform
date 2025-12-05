'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import Logo from "@/app/assets/icons/logo.svg";
import FacebookIcon from "@/app/assets/icons/facebook.svg";
import GithubIcon from "@/app/assets/icons/github.svg";
import GoogleIcon from "@/app/assets/icons/google.svg";
import Envelope from "@/app/assets/icons/envelope.svg";
import Lock from "@/app/assets/icons/lock.svg";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Eye from "@/app/assets/icons/eye.svg";
import EyeOff from "@/app/assets/icons/eye-off.svg";
import { useRouter } from 'next/navigation';
import { useSignIn } from '@clerk/nextjs';

export default function Login() {
  const router = useRouter();
  const {isLoaded, signIn, setActive} = useSignIn();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    email_code: ''
  });

  const [pendingVerification, setPendingVerification] = useState(false);
  const [userEnteredCode, setUserEnteredCode] = useState<string>("");

  const validateForm = () => {
    let valid = true;
    const newErrors = { email: '', password: '', email_code: '' };
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
      valid = false;
    }
    
    setErrors(newErrors);
    return valid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        setIsLoading(true);
        await signIn?.create({
          identifier: formData.email,
          strategy: "email_code"
        });
        setPendingVerification(true);
      } catch (error: any) {
        console.log(JSON.stringify(error, null, 2));
        alert(JSON.stringify(error.errors));
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleOnPressVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!isLoaded) return;    
    try {
      setIsLoading(true);
      const completeSignIn = await signIn?.attemptFirstFactor({code: userEnteredCode, strategy: "email_code"});
      if(completeSignIn.status !== "complete") {
        console.log(JSON.stringify(completeSignIn, null, 2));
      }
      if(completeSignIn.status === "complete") {
        console.log(completeSignIn);
        await setActive({session: completeSignIn.createdSessionId});
        router.push('/home')
      }
    } catch (error: any) {
      console.log(error);
      alert(error.errors[0].message);
    } finally {
      setIsLoading(false);
    }
  }

  const handleGoogleAuth = () => {
    if (!isLoaded || !signIn) return;
    
    signIn.authenticateWithRedirect({
      strategy: "oauth_google",
      redirectUrl: "/sso-callback",
      redirectUrlComplete: "/home",
    });
  };

  return (
    <div className="flex flex-col h-screen w-screen">
      <div className="flex flex-col justify-end items-center gap-[20px] py-[22px] w-full h-auto md:h-[50%] shadow-[0px_1px_9.9px_rgba(75,109,71,0.08)]">
        <Logo className="w-auto h-auto" />
        <div className="flex flex-col gap-[4px] px-4">
            <h3 className="text-[16px]/[24px] text-center font-[600]">Login to Interview AI</h3>
            <span className="text-[14px]/[20px] text-center font-[400]">Welcome back! Please sign in to continue</span>
        </div>
        <div className="flex flex-wrap justify-center gap-[12px] px-4">
            <Button variant="outline" className="w-[100px] sm:w-[120px] h-[40px] flex items-center justify-center transition-colors hover:bg-slate-50"><FacebookIcon className="size-5" /></Button>
            <Button variant="outline" className="w-[100px] sm:w-[120px] h-[40px] flex items-center justify-center transition-colors hover:bg-slate-50"><GithubIcon className="size-5" /></Button>
            <Button onClick={handleGoogleAuth} variant="outline" className="w-[100px] sm:w-[120px] h-[40px] flex items-center justify-center transition-colors hover:bg-slate-50"><GoogleIcon className="size-5" /></Button>
        </div>
      </div>
      <div className="flex flex-col justify-start items-center flex-1 py-[22px] gap-[10px] w-full bg-[#f5f5f5] overflow-y-auto">
        {pendingVerification ? <form onSubmit={handleOnPressVerify} className="flex flex-col gap-[20px] w-full max-w-[320px] px-4">
          <div className="flex flex-col rounded-[6px] border bg-white shadow-sm">
                <div className="flex flex-col w-full">
                    <div className="flex items-center px-[12px] gap-[8px] border-b-[0.5px]">
                        <Lock className="size-5 text-gray-500" />
                        <Input 
                          placeholder="Email Code" 
                          name="emailCode"
                          disabled={!isLoaded && signIn}
                          value={userEnteredCode}
                          onChange={(e) => {
                            e.preventDefault();
                            setUserEnteredCode(e.target.value);
                          }}
                          className="border-none focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none" 
                        />
                    </div>
                    {errors.email_code && <p className="text-red-500 text-[12px] px-[12px] py-1">{errors.email_code}</p>}
                </div>
            </div>
            <Button 
              type="submit"
              variant="default" 
              className="w-full transition-colors hover:bg-primary/90 active:scale-[0.98]"
              disabled={isLoading}
            >
              {isLoading ? 'Verifying...' : 'Verify'}
            </Button>
        </form> : <form onSubmit={handleLogin} className="flex flex-col gap-[20px] w-full max-w-[320px] px-4">
            <div className="flex flex-col rounded-[6px] border bg-white shadow-sm">
                <div className="flex flex-col w-full">
                    <div className="flex items-center px-[12px] gap-[8px] border-b-[0.5px]">
                        <Envelope className="size-5 text-gray-500" />
                        <Input 
                          placeholder="Email" 
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="border-none focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none" 
                        />
                    </div>
                    {errors.email && <p className="text-red-500 text-[12px] px-[12px] py-1">{errors.email}</p>}
                </div>
            </div>

            <Button 
              type="submit"
              variant="default" 
              className="w-full transition-colors hover:bg-primary/90 active:scale-[0.98]"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>

            <span className="text-center text-[14px]/[20px] font-[500]">{"Don't have an account?"} <Link className="underline text-primary hover:text-primary/80 transition-colors" href="/register">Sign Up</Link></span>
        </form>}
      </div>
    </div>
  );
}

