'use client';

import { useState } from 'react';
import Logo from "@/app/assets/icons/logo.svg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Step components
const Step1 = ({ onNext, onSkip }: { onNext: (data: any) => void, onSkip: () => void }) => {
  const [profession, setProfession] = useState('');

  return (
    <div className="flex flex-col gap-[8px] w-full">
      <h4 className="text-[14px]/[20px] font-[500] text-center">What is your profession?</h4>
      <div className="flex items-center gap-[8px] p-[6px_12px] w-[320px] rounded-[6px] border bg-white shadow-[0px_0px_0px_1px_rgba(231,230,228,1),0px_1px_2px_0px_rgba(0,0,0,0.06)]">
        <Input 
          placeholder="Select Profession" 
          value={profession}
          onChange={(e) => setProfession(e.target.value)}
          className="border-none focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none text-[14px]/[20px] placeholder:text-[#D6D6D6]"
        />
        <div className="w-[16px] h-[16px] flex items-center justify-center">
          <svg width="6" height="3" viewBox="0 0 6 3" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 3L0 0H6L3 3Z" fill="#565654"/>
          </svg>
        </div>
      </div>
      <div className="flex flex-col items-center gap-[14px] w-full mt-[20px]">
        <Button 
          className="w-full shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05),inset_0px_-2px_0px_0px_rgba(0,0,0,0.25)]" 
          onClick={() => onNext({ profession })}
        >
          Next
        </Button>
        <div className="flex justify-center items-center w-full gap-[20px]">
          <span 
            className="text-[14px]/[20px] font-[500] text-[#565654] cursor-pointer"
            onClick={onSkip}
          >
            Skip
          </span>
        </div>
      </div>
    </div>
  );
};

const Step2 = ({ onNext, onBack, onSkip }: { onNext: (data: any) => void, onBack: () => void, onSkip: () => void }) => {
  const [industry, setIndustry] = useState('');

  return (
    <div className="flex flex-col gap-[8px] w-full">
      <h4 className="text-[14px]/[20px] font-[500] text-center">What industry do you work in?</h4>
      <div className="flex items-center gap-[8px] p-[6px_12px] w-[320px] rounded-[6px] border bg-white shadow-[0px_0px_0px_1px_rgba(231,230,228,1),0px_1px_2px_0px_rgba(0,0,0,0.06)]">
        <Input 
          placeholder="Select Industry" 
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          className="border-none focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none text-[14px]/[20px] placeholder:text-[#D6D6D6]"
        />
        <div className="w-[16px] h-[16px] flex items-center justify-center">
          <svg width="6" height="3" viewBox="0 0 6 3" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 3L0 0H6L3 3Z" fill="#565654"/>
          </svg>
        </div>
      </div>
      <div className="flex flex-col items-center gap-[14px] w-full mt-[20px]">
        <Button 
          className="w-full shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05),inset_0px_-2px_0px_0px_rgba(0,0,0,0.25)]" 
          onClick={() => onNext({ industry })}
        >
          Next
        </Button>
        <div className="flex justify-center items-center w-full gap-[20px]">
          <span 
            className="text-[14px]/[20px] font-[500] text-[#565654] cursor-pointer"
            onClick={onBack}
          >
            Back
          </span>
          <div className="w-[1px] h-[16px] bg-[#DADADA]"></div>
          <span 
            className="text-[14px]/[20px] font-[500] text-[#565654] cursor-pointer"
            onClick={onSkip}
          >
            Skip
          </span>
        </div>
      </div>
    </div>
  );
};

const Step3 = ({ onNext, onBack, onSkip }: { onNext: (data: any) => void, onBack: () => void, onSkip: () => void }) => {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [uploaded, setUploaded] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setUploaded(true);
    }
  };

  return (
    <div className="flex flex-col gap-[8px] w-full">
      <h4 className="text-[14px]/[20px] font-[500] text-center">Upload your resume</h4>
      
      {!uploaded ? (
        <label className="flex items-center gap-[8px] p-[6px_12px] w-[320px] rounded-[6px] border bg-white shadow-[0px_0px_0px_1px_rgba(231,230,228,1),0px_1px_2px_0px_rgba(0,0,0,0.06)] cursor-pointer">
          <span className="text-[14px]/[20px] text-[#D6D6D6]">Select File</span>
          <div className="w-[16px] h-[16px] flex items-center justify-center ml-auto">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 1V11M1 6H11" stroke="#565654" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <input type="file" className="hidden" onChange={handleFileChange} />
        </label>
      ) : (
        <div className="flex items-center gap-[6px] p-[0px_12px] w-[320px]">
          <div className="w-[16px] h-[16px] flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 3L4.5 8.5L2 6" stroke="#00B463" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-[12px]/[16px] font-[500] text-[#00B463]">{fileName}</span>
        </div>
      )}
      
      <div className="flex flex-col items-center gap-[14px] w-full mt-[20px]">
        <Button 
          className="w-full shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05),inset_0px_-2px_0px_0px_rgba(0,0,0,0.25)]" 
          onClick={() => onNext({ file, fileName })}
        >
          Next
        </Button>
        <div className="flex justify-center items-center w-full gap-[20px]">
          <span 
            className="text-[14px]/[20px] font-[500] text-[#565654] cursor-pointer"
            onClick={onBack}
          >
            Back
          </span>
          <div className="w-[1px] h-[16px] bg-[#DADADA]"></div>
          <span 
            className="text-[14px]/[20px] font-[500] text-[#565654] cursor-pointer"
            onClick={onSkip}
          >
            Skip
          </span>
        </div>
      </div>
    </div>
  );
};

const Step4 = ({ onNext, onBack, onSkip }: { onNext: (data: any) => void, onBack: () => void, onSkip: () => void }) => {
  const [skills, setSkills] = useState('');

  return (
    <div className="flex flex-col gap-[8px] w-full">
      <h4 className="text-[14px]/[20px] font-[500] text-center">What are your prominent skills?</h4>
      <div className="flex items-start p-[6px_12px] w-[320px] h-[112px] rounded-[6px] border bg-white shadow-[0px_0px_0px_1px_rgba(231,230,228,1),0px_1px_2px_0px_rgba(0,0,0,0.06)]">
        <textarea 
          placeholder="Type" 
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          className="w-full h-full resize-none border-none focus:outline-none text-[14px]/[20px] placeholder:text-[#D6D6D6]"
        />
      </div>
      <div className="flex flex-col items-center gap-[14px] w-full mt-[20px]">
        <Button 
          className="w-full shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05),inset_0px_-2px_0px_0px_rgba(0,0,0,0.25)]" 
          onClick={() => onNext({ skills })}
        >
          Next
        </Button>
        <div className="flex justify-center items-center w-full gap-[20px]">
          <span 
            className="text-[14px]/[20px] font-[500] text-[#565654] cursor-pointer"
            onClick={onBack}
          >
            Back
          </span>
          <div className="w-[1px] h-[16px] bg-[#DADADA]"></div>
          <span 
            className="text-[14px]/[20px] font-[500] text-[#565654] cursor-pointer"
            onClick={onSkip}
          >
            Skip
          </span>
        </div>
      </div>
    </div>
  );
};

const Step5 = ({ onComplete, onBack, onSkip }: { onComplete: (data: any) => void, onBack: () => void, onSkip: () => void }) => {
  const [experience, setExperience] = useState('');

  return (
    <div className="flex flex-col gap-[8px] w-full">
      <h4 className="text-[14px]/[20px] font-[500] text-center">How many years of experience do you have?</h4>
      <div className="flex items-center gap-[8px] p-[6px_12px] w-[320px] rounded-[6px] border bg-white shadow-[0px_0px_0px_1px_rgba(231,230,228,1),0px_1px_2px_0px_rgba(0,0,0,0.06)]">
        <Input 
          placeholder="Enter number" 
          type="number"
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
          className="border-none focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none text-[14px]/[20px] placeholder:text-[#D6D6D6]"
        />
      </div>
      <div className="flex flex-col items-center gap-[14px] w-full mt-[20px]">
        <Button 
          className="w-full shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05),inset_0px_-2px_0px_0px_rgba(0,0,0,0.25)]" 
          onClick={() => onComplete({ experience: parseInt(experience) || 0 })}
        >
          Complete
        </Button>
        <div className="flex justify-center items-center w-full gap-[20px]">
          <span 
            className="text-[14px]/[20px] font-[500] text-[#565654] cursor-pointer"
            onClick={onBack}
          >
            Back
          </span>
          <div className="w-[1px] h-[16px] bg-[#DADADA]"></div>
          <span 
            className="text-[14px]/[20px] font-[500] text-[#565654] cursor-pointer"
            onClick={onSkip}
          >
            Skip
          </span>
        </div>
      </div>
    </div>
  );
};

// Progress indicator component
const ProgressIndicator = ({ currentStep, totalSteps }: { currentStep: number, totalSteps: number }) => {
  return (
    <div className="flex gap-[8px] justify-center mb-[20px]">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div 
          key={index} 
          className={cn(
            "w-[8px] h-[8px] rounded-full", 
            index < currentStep ? "bg-primary" : "bg-gray-300"
          )}
        />
      ))}
    </div>
  );
};

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Record<string, any>>({
    profession: '',
    industry: '',
    resume: null,
    skills: '',
    experience: 0
  });

  const totalSteps = 5;

  const handleNext = (stepData: any) => {
    setFormData(prev => ({ ...prev, ...stepData }));
    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSkip = () => {
    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  };

  const handleComplete = (stepData: any) => {
    setFormData(prev => ({ ...prev, ...stepData }));
    // Here you would typically submit the form data to your backend
    console.log('Form submitted:', { ...formData, ...stepData });
    // Redirect to dashboard or home page after completion
    window.location.href = '/';
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#FAF9F7]">
      <div className="flex flex-col justify-end items-center gap-[20px] py-[22px] w-full h-[50%] bg-white shadow-[0px_1px_9.9px_rgba(75,109,71,0.08)]">
        <div className="flex justify-center items-center rounded-[8px] bg-primary shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05),inset_0px_-3px_0px_0px_rgba(0,0,0,0.25)]">
          <Logo />
        </div>
        <div className="flex flex-col gap-[4px]">
          <h3 className="text-[16px]/[24px] text-center font-[600]">You are only few steps away</h3>
          <span className="text-[14px]/[20px] text-center font-[400] text-[#565654]">Complete Your Profile</span>
        </div>
      </div>
      
      <div className="flex flex-col justify-start items-center h-[50%] py-[22px] gap-[10px] w-full">
        <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} />
        
        <div className="flex flex-col gap-[20px] w-[320px]">
          {currentStep === 1 && <Step1 onNext={handleNext} onSkip={handleSkip} />}
          {currentStep === 2 && <Step2 onNext={handleNext} onBack={handleBack} onSkip={handleSkip} />}
          {currentStep === 3 && <Step3 onNext={handleNext} onBack={handleBack} onSkip={handleSkip} />}
          {currentStep === 4 && <Step4 onNext={handleNext} onBack={handleBack} onSkip={handleSkip} />}
          {currentStep === 5 && <Step5 onComplete={handleComplete} onBack={handleBack} onSkip={handleSkip} />}
        </div>
      </div>
    </div>
  );
}