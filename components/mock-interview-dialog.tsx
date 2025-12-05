'use client';

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import Link from "next/link";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

interface MockInterviewDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const MockInterviewDialog = ({ open, onOpenChange }: MockInterviewDialogProps) => {
    const router = useRouter();
    const { user, isLoaded } = useUser();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [interviewId, setInterviewId] = useState<number | null>(null);
    const cvFileInputRef = useRef<HTMLInputElement>(null);
    const jdFileInputRef = useRef<HTMLInputElement>(null);
    
    const [formData, setFormData] = useState({
        jobTitle: '',
        companyName: '',
        jobDescription: '',
        yearsOfExperience: '',
    });

    const [files, setFiles] = useState({
        cv: null as File | null,
        jobDescriptionFile: null as File | null,
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        // Convert kebab-case to camelCase
        const fieldName = id.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase()).replace(/-/g, '');
        setFormData(prev => ({
            ...prev,
            [fieldName]: value,
        }));
    };

    const handleCvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFiles(prev => ({ ...prev, cv: file }));
        }
    };

    const handleJdUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFiles(prev => ({ ...prev, jobDescriptionFile: file }));
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);

        try {
            // Check if user is loaded and authenticated
            if (!isLoaded || !user) {
                setError('Please sign in to create an interview');
                setLoading(false);
                return;
            }

            // Validate required fields
            if (!formData.jobTitle || !formData.companyName) {
                setError('Job title and company name are required');
                setLoading(false);
                return;
            }

            const submitData = new FormData();
            submitData.append('jobTitle', formData.jobTitle);
            submitData.append('companyName', formData.companyName);
            submitData.append('jobDescription', formData.jobDescription);
            submitData.append('yearsOfExperience', formData.yearsOfExperience);
            
            if (files.cv) {
                submitData.append('cv', files.cv);
            }
            
            if (files.jobDescriptionFile) {
                submitData.append('jobDescriptionFile', files.jobDescriptionFile);
            }

            const response = await fetch('/api/mock-interview', {
                method: 'POST',
                body: submitData,
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to create interview');
            }

            setInterviewId(result.data.id);
            
            // Navigate to interview page with the new ID
            router.push(`/home/practice-interview/${result.data.id}`);
            onOpenChange(false);
            
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="p-0">
                <DialogHeader>
                    <DialogTitle></DialogTitle>
                    <DialogDescription></DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-start bg-white rounded-lg">
                    <div className="flex flex-col gap-2 p-4">
                        <h1 className="text-black text-[20px] font-medium">Tell us more about that job!</h1>
                        <p className="text-black text-[16px] text-gray-600">
                            This helps us understand on a deeper level and help you ace that interview.
                        </p>
                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                                {error}
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col bg-[#FAF9F7] p-4 w-full border-b border-t gap-4">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="job-title" className="text-black text-[14px]">
                                Job Title <span className="text-red-500">*</span>
                            </label>
                            <Input 
                                id="job-title" 
                                placeholder="e.g. Software Engineer"
                                value={formData.jobTitle}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="company-name" className="text-black text-[14px]">
                                Company Name <span className="text-red-500">*</span>
                            </label>
                            <Input 
                                id="company-name" 
                                placeholder="e.g. Google"
                                value={formData.companyName}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="job-description" className="text-black text-[14px]">Job Description</label>
                            <Input 
                                id="job-description" 
                                placeholder="e.g. We are looking for a Software Engineer to join our team."
                                value={formData.jobDescription}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="years-of-experience" className="text-black text-[14px]">Years of Experience</label>
                            <Input 
                                id="years-of-experience" 
                                placeholder="e.g. 5"
                                type="number"
                                value={formData.yearsOfExperience}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="cv-upload" className="text-black text-[14px]">Upload Your CV/Resume</label>
                            <input
                                ref={cvFileInputRef}
                                id="cv-upload"
                                type="file"
                                accept=".pdf,.doc,.docx"
                                onChange={handleCvUpload}
                                className="hidden"
                            />
                            <Button 
                                type="button"
                                variant="outline" 
                                onClick={() => cvFileInputRef.current?.click()}
                                className="w-full"
                            >
                                {files.cv ? files.cv.name : 'Choose File'}
                            </Button>
                        </div>
                    </div>
                    <div className="flex justify-between w-full px-2 py-4">
                        <div>
                            <input
                                ref={jdFileInputRef}
                                id="jd-upload"
                                type="file"
                                accept=".pdf,.doc,.docx,.txt"
                                onChange={handleJdUpload}
                                className="hidden"
                            />
                            <Button 
                                variant="link"
                                type="button"
                                onClick={() => jdFileInputRef.current?.click()}
                            >
                                {files.jobDescriptionFile ? files.jobDescriptionFile.name : 'Upload Job Description'}
                            </Button>
                        </div>
                        <div className="flex gap-2">
                            <DialogClose asChild>
                                <Button variant="outline" disabled={loading}>Cancel</Button>
                            </DialogClose>
                            <Button 
                                onClick={handleSubmit} 
                                disabled={loading}
                            >
                                {loading ? 'Creating...' : 'Start Interview'}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default MockInterviewDialog;
