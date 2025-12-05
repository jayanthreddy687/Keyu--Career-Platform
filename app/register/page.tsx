'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import Logo from "@/app/assets/icons/logo.svg";
import FacebookIcon from "@/app/assets/icons/facebook.svg";
import GithubIcon from "@/app/assets/icons/github.svg";
import GoogleIcon from "@/app/assets/icons/google.svg";
import Envelope from "@/app/assets/icons/envelope.svg";
import Lock from "@/app/assets/icons/lock.svg";
import IdentificationCard from "@/app/assets/icons/identification-card.svg";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useSignUp } from '@clerk/nextjs';
import Eye from "@/app/assets/icons/eye.svg";
import EyeOff from "@/app/assets/icons/eye-off.svg";
import { useRouter } from 'next/navigation';

export default function Register() {
  const router = useRouter();
  const {isLoaded, signUp, setActive} = useSignUp();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    email_code: '',
  });
  const [pendingVerification, setPendingVerification] = useState<boolean>(false);
  const [userEnteredCode, setUserEnteredCode] = useState<string>("");

  const validateForm = () => {
    let valid = true;
    const newErrors = { name: '', email: '', password: '', confirmPassword: '', email_code: '' };
    
    // Name validation
    if (!formData.name) {
      newErrors.name = 'Name is required';
      valid = false;
    }
    
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        setIsLoading(true);
        await signUp?.create({
          firstName: formData.name,
          emailAddress: formData.email,
        });

        await signUp?.prepareEmailAddressVerification({
          strategy: "email_code"
        });
        setPendingVerification(true);
      } catch (error: any) {
        console.log(JSON.stringify(error, null, 2));
        alert(error.errors[0].message);
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
      const completeSignUp = await signUp?.attemptEmailAddressVerification({code: userEnteredCode});
      if(completeSignUp.status !== "complete") {
        console.log(JSON.stringify(completeSignUp, null, 2));
      }
      if(completeSignUp.status === "complete") {
        console.log(completeSignUp);
        alert("signUpSuccessful");
        await setActive({session: completeSignUp.createdSessionId});
        router.push('/home')
      }
    } catch (error: any) {
      console.log(error);
      alert(error.errors[0].message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-screen w-screen">
      <div className="flex flex-col justify-end items-center gap-[20px] py-[22px] w-full h-auto md:h-[50%] shadow-[0px_1px_9.9px_rgba(75,109,71,0.08)]">
        <Logo className="w-auto h-auto" />
        <div className="flex flex-col gap-[4px] px-4">
            <h3 className="text-[16px]/[24px] text-center font-[600]">Create an Interview AI account</h3>
            <span className="text-[14px]/[20px] text-center font-[400]">Choose a Sign-in method to continue</span>
        </div>
        <div className="flex flex-wrap justify-center gap-[12px] px-4">
            <Button variant="outline" className="w-[100px] sm:w-[120px] h-[40px] flex items-center justify-center transition-colors hover:bg-slate-50"><FacebookIcon className="size-5" /></Button>
            <Button variant="outline" className="w-[100px] sm:w-[120px] h-[40px] flex items-center justify-center transition-colors hover:bg-slate-50"><GithubIcon className="size-5" /></Button>
            <Button variant="outline" className="w-[100px] sm:w-[120px] h-[40px] flex items-center justify-center transition-colors hover:bg-slate-50"><GoogleIcon className="size-5" /></Button>
        </div>
      </div>
      <div className="flex flex-col justify-start items-center flex-1 py-[22px] gap-[10px] w-full bg-[#f5f5f5] overflow-y-auto">
        {pendingVerification ? <form onSubmit={handleOnPressVerify} className="flex flex-col gap-[20px] w-full max-w-[320px] px-4">
          <div className="flex flex-col rounded-[6px] border bg-white shadow-sm">
                <div className="flex flex-col w-full">
                    <div className="flex items-center px-[12px] gap-[8px] border-b-[0.5px]">
                        <IdentificationCard className="size-5 text-gray-500" />
                        <Input 
                          placeholder="Email Code" 
                          name="emailCode"
                          disabled={!isLoaded && signUp}
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
        </form> : <form onSubmit={handleRegister} className="flex flex-col gap-[20px] w-full max-w-[320px] px-4">
            <div className="flex flex-col rounded-[6px] border bg-white shadow-sm">
                <div className="flex flex-col w-full">
                    <div className="flex items-center px-[12px] gap-[8px] border-b-[0.5px]">
                        <IdentificationCard className="size-5 text-gray-500" />
                        <Input 
                          placeholder="Name" 
                          name="name"
                          disabled={!isLoaded && signUp}
                          value={formData.name}
                          onChange={handleChange}
                          className="border-none focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none" 
                        />
                    </div>
                    {errors.name && <p className="text-red-500 text-[12px] px-[12px] py-1">{errors.name}</p>}
                </div>
                <div className="flex flex-col w-full">
                    <div className="flex items-center px-[12px] gap-[8px] border-b-[0.5px]">
                        <Envelope className="size-5 text-gray-500" />
                        <Input 
                          placeholder="Email" 
                          name="email"
                          value={formData.email}
                          disabled={!isLoaded && signUp}
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
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </Button>

            <span className="text-center text-[14px]/[20px] font-[500]">Already Have an Account? <Link className="underline text-primary hover:text-primary/80 transition-colors" href="/login">Login</Link></span>
        </form>}
      </div>
    </div>
  );
}