'use client';

import { Button } from "@/components/ui/button";
import { Captions, CaptionsOff, Disc2, Mic, MicOff, PhoneOff, User, Video, VideoOff } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import Avatar from '@/app/assets/icons/avatar.svg';
import { useState, useEffect, useRef, useCallback } from "react";
import { ttsService } from "@/lib/services/tts-service";

interface TranscriptMessage {
    text: string;
    timestamp: string;
    isUser: boolean;
}

interface ConversationMessage {
    role: "user" | "assistant";
    content: string;
    timestamp?: string;
}

interface InterviewDetails {
    id: number;
    jobTitle: string;
    companyName: string;
    jobDescription: string | null;
    yearsOfExperience: number | null;
}

const InterviewPage = () => {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    
    const [isMicOn, setIsMicOn] = useState(true);
    const [isVideoOn, setIsVideoOn] = useState(false);
    const [isCaptionsOn, setIsCaptionsOn] = useState(true);
    const [transcripts, setTranscripts] = useState<TranscriptMessage[]>([]);
    const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isEndingInterview, setIsEndingInterview] = useState(false);
    const [interviewDetails, setInterviewDetails] = useState<InterviewDetails | null>(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(true);
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const socketRef = useRef<WebSocket | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const processorRef = useRef<ScriptProcessorNode | null>(null);
    const isSpeakingRef = useRef<boolean>(false);
    const isMicOnRef = useRef<boolean>(true);
    const conversationHistoryRef = useRef<ConversationMessage[]>([]);
    const transcriptContainerRef = useRef<HTMLDivElement>(null);
    const lastProcessedTranscriptRef = useRef<string>('');
    const isProcessingRef = useRef<boolean>(false);
    const hasInitializedRef = useRef<boolean>(false);

    const handleMicClick = () => {
        // Stop AI speaking when user wants to talk
        if (!isMicOn && isSpeaking) {
            ttsService.stop();
            setIsSpeaking(false);
            isSpeakingRef.current = false;
        }
        const newMicState = !isMicOn;
        setIsMicOn(newMicState);
        isMicOnRef.current = newMicState;
        
        // Reset processing flags when unmuting to allow new input
        if (newMicState) {
            isProcessingRef.current = false;
        }
    }

    const handleVideoClick = () => {
        setIsVideoOn(!isVideoOn);
    }
    
    useEffect(() => {
        let stream: MediaStream | null = null;
        
        const setupCamera = async () => {
            try {
                if (isVideoOn) {
                    stream = await navigator.mediaDevices.getUserMedia({ video: true });
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                    }
                } else {
                    if (videoRef.current) {
                        videoRef.current.srcObject = null;
                    }
                    if (stream) {
                        stream.getTracks().forEach(track => track.stop());
                    }
                }
            } catch (error) {
                console.error('Error accessing camera:', error);
            }
        };
        
        setupCamera();
        
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [isVideoOn]);

    const handleCaptionsClick = () => {
        setIsCaptionsOn(!isCaptionsOn);
    }

    const cleanupMediaResources = useCallback(async () => {
        // Stop TTS
        ttsService.stop();
        setIsSpeaking(false);
        isSpeakingRef.current = false;

        // Stop microphone first to prevent further audio processing
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }

        // Disconnect audio processor before closing context
        if (processorRef.current) {
            processorRef.current.disconnect();
            processorRef.current.onaudioprocess = null; // Remove the callback
            processorRef.current = null;
        }

        // Close audio context
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            await audioContextRef.current.close();
            audioContextRef.current = null;
        }

        // Finally close the WebSocket connection
        if (socketRef.current) {
            if (socketRef.current.readyState === WebSocket.OPEN) {
                socketRef.current.send(JSON.stringify({ type: "Terminate" }));
            }
            socketRef.current.close();
            socketRef.current = null;
        }
    }, []);

    // Fetch interview details on mount
    useEffect(() => {
        const fetchInterviewDetails = async () => {
            try {
                setIsLoadingDetails(true);
                const response = await fetch(`/api/mock-interview?id=${id}`);
                const data = await response.json();
                
                if (data.success && data.data) {
                    setInterviewDetails(data.data);
                } else {
                    console.error('Failed to load interview details:', data.error);
                }
            } catch (error) {
                console.error('Error fetching interview details:', error);
            } finally {
                setIsLoadingDetails(false);
            }
        };

        if (id) {
            fetchInterviewDetails();
        }
    }, [id]);

    const handleEndInterview = useCallback(async () => {
        if (isEndingInterview) return;
        
        setIsEndingInterview(true);
        setIsMicOn(false);
        isMicOnRef.current = false; // Stop the audio processor from sending data
        setIsVideoOn(false);

        try {
            await cleanupMediaResources();

            if (conversationId && conversationHistoryRef.current.length > 0) {
                const response = await fetch('/api/save-conversation', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        conversation_id: conversationId,
                        conversation_history: conversationHistoryRef.current,
                        metadata: {
                            userId: id,
                            interviewType: 'practice-interview',
                            endTime: new Date().toISOString(),
                            totalMessages: conversationHistoryRef.current.length
                        }
                    })
                });

                const data = await response.json();
                
                if (data.success) {
                    console.log('Conversation saved:', data.s3Key);
                } else {
                    console.error('Failed to save conversation:', data.error);
                }
            }
        } catch (error) {
            console.error('Error ending interview:', error);
        } finally {
            router.push('/home/practice-interview');
        }
    }, [isEndingInterview, conversationId, id, router, cleanupMediaResources]);

    useEffect(() => {
        if (transcriptContainerRef.current) {
            transcriptContainerRef.current.scrollTo({
                top: transcriptContainerRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [transcripts]);

    // Text-to-Speech function using AWS Polly
    const speakText = async (text: string) => {
        try {
            await ttsService.speak(text, {
                voice: 'Amy', // British female voice
                engine: 'neural',
                onStart: () => {
                    console.log('AI started speaking');
                    setIsSpeaking(true);
                    isSpeakingRef.current = true;
                },
                onEnd: () => {
                    console.log('AI finished speaking');
                    setIsSpeaking(false);
                    isSpeakingRef.current = false;
                    
                    // Small cooldown to prevent capturing tail end of AI speech
                    setTimeout(() => {
                        isProcessingRef.current = false;
                    }, 500);
                },
                onError: (error) => {
                    console.error('TTS error:', error);
                    setIsSpeaking(false);
                    isSpeakingRef.current = false;
                    isProcessingRef.current = false;
                }
            });
        } catch (error) {
            console.error('Failed to speak text:', error);
        }
    };

    // Initial greeting from AI interviewer
    useEffect(() => {
        // Only start the interview once details are loaded
        if (isLoadingDetails || !interviewDetails) return;
        
        // Prevent duplicate initialization (React Strict Mode runs effects twice)
        if (hasInitializedRef.current) return;
        hasInitializedRef.current = true;

        const startInterview = async () => {
            const now = new Date();
            const timestamp = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
            
            try {
                // Get dynamic opening from LLM
                const response = await fetch('/api/lemur/v2', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        transcript_text: "START_INTERVIEW", // Special trigger
                        conversation_history: [],
                        interview_id: id,
                        interview_context: {
                            jobTitle: interviewDetails.jobTitle,
                            companyName: interviewDetails.companyName,
                            jobDescription: interviewDetails.jobDescription,
                            yearsOfExperience: interviewDetails.yearsOfExperience
                        }
                    })
                });

                const data = await response.json();
                const greeting = data.response;

                setTranscripts([{
                    text: greeting,
                    timestamp,
                    isUser: false
                }]);

                const initialHistory: ConversationMessage[] = [{
                    role: "assistant",
                    content: greeting,
                    timestamp: new Date().toISOString()
                }];
                
                setConversationHistory(initialHistory);
                conversationHistoryRef.current = initialHistory;

                if (data.conversation_id) {
                    setConversationId(data.conversation_id);
                }

                setTimeout(() => speakText(greeting), 500);
            } catch (error) {
                console.error('Error getting initial greeting:', error);
                // Fallback to simple greeting if API fails
                const fallbackGreeting = "Hello! Thanks for joining me today. Let's begin the interview.";
                setTranscripts([{
                    text: fallbackGreeting,
                    timestamp,
                    isUser: false
                }]);
                
                const initialHistory: ConversationMessage[] = [{
                    role: "assistant",
                    content: fallbackGreeting,
                    timestamp: new Date().toISOString()
                }];
                
                setConversationHistory(initialHistory);
                conversationHistoryRef.current = initialHistory;
                
                setTimeout(() => speakText(fallbackGreeting), 500);
            }
        };

        startInterview();

        // Cleanup TTS on unmount
        return () => {
            ttsService.stop();
            setIsSpeaking(false);
            isSpeakingRef.current = false;
            hasInitializedRef.current = false; // Reset for potential remount
        };
    }, [isLoadingDetails, interviewDetails, id]);

    // Assembly AI transcription effect
    useEffect(() => {
        // Don't start transcription until interview details are loaded
        if (isLoadingDetails || !interviewDetails) return;

        const startTranscription = async () => {
            try {
                // Get microphone access
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaStreamRef.current = stream;

                // Connect to Assembly AI v3 streaming WebSocket (use API key directly)
                const apiKey = process.env.NEXT_PUBLIC_ASSEMBLY_AI_API_KEY;
                console.log('Connecting to WebSocket...');
                
                const socket = new WebSocket(
                    `wss://streaming.assemblyai.com/v3/ws?sample_rate=16000&format_turns=true&token=${apiKey}`
                );

                socketRef.current = socket;

                socket.onopen = () => {
                    console.log("WebSocket connection opened");
                };

                socket.onmessage = (message) => {
                    const data = JSON.parse(message.data);
                    console.log('Received message:', data);
                    
                    if (data.type === 'Begin') {
                        console.log('Session began with ID:', data.id);
                    }
                    
                    if (data.type === 'Turn') {
                        const transcript = data.transcript;
                        const isFormatted = data.turn_is_formatted;
                        
                        if (transcript && isFormatted) {
                            console.log('Turn (formatted):', transcript);
                            
                            // Prevent processing duplicates or if already processing
                            if (isProcessingRef.current) {
                                console.log('Already processing a transcript, skipping...');
                                return;
                            }
                            
                            // Prevent processing the same transcript twice
                            if (lastProcessedTranscriptRef.current === transcript) {
                                console.log('Duplicate transcript detected, skipping...');
                                return;
                            }
                            
                            // Prevent processing while AI is speaking
                            if (isSpeakingRef.current) {
                                console.log('AI is speaking, skipping transcript...');
                                return;
                            }
                            
                            // Ignore very short transcripts (likely noise)
                            if (transcript.trim().length < 2) {
                                console.log('Transcript too short, skipping...');
                                return;
                            }
                            
                            // Mark as processing and save last transcript
                            isProcessingRef.current = true;
                            lastProcessedTranscriptRef.current = transcript;
                            
                            const now = new Date();
                            const timestamp = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
                            
                            // Add user's transcript
                            setTranscripts(prev => [...prev, {
                                text: transcript,
                                timestamp,
                                isUser: true
                            }]);

                            const currentHistory = conversationHistoryRef.current;

                            fetch('/api/lemur/v2', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ 
                                    transcript_text: transcript,
                                    conversation_history: currentHistory,
                                    conversation_id: conversationId,
                                    interview_id: id, // Pass interview ID for resume fetching
                                    interview_context: interviewDetails ? {
                                        jobTitle: interviewDetails.jobTitle,
                                        companyName: interviewDetails.companyName,
                                        jobDescription: interviewDetails.jobDescription,
                                        yearsOfExperience: interviewDetails.yearsOfExperience
                                    } : null
                                })
                            })
                            .then(res => res.json())
                            .then(data => {
                                if (data.response) {
                                    if (data.conversation_id && !conversationId) {
                                        setConversationId(data.conversation_id);
                                    }

                                    const aiTimestamp = new Date();
                                    const aiTime = `${aiTimestamp.getHours().toString().padStart(2, '0')}:${aiTimestamp.getMinutes().toString().padStart(2, '0')}`;
                                    
                                    setTranscripts(prev => [...prev, {
                                        text: data.response,
                                        timestamp: aiTime,
                                        isUser: false
                                    }]);

                                    if (data.updated_history) {
                                        conversationHistoryRef.current = data.updated_history;
                                        setConversationHistory(data.updated_history);
                                    }

                                    speakText(data.response);
                                }
                            })
                            .catch(error => {
                                console.error('Error getting AI response:', error);
                            })
                            .finally(() => {
                                // Reset processing flag after completion
                                isProcessingRef.current = false;
                            });
                        } else if (transcript) {
                            console.log('Turn (partial):', transcript);
                        }
                    }
                    
                    if (data.type === 'Termination') {
                        console.log('Session terminated:', data);
                    }
                };

                socket.onerror = (error) => {
                    console.error('WebSocket error:', error);
                };

                socket.onclose = (event) => {
                    console.log('WebSocket closed:', event.code, event.reason);
                };

                // Wait for socket to open
                await new Promise((resolve) => {
                    socket.addEventListener('open', resolve, { once: true });
                });

                // Set up audio processing
                const audioContext = new AudioContext({ sampleRate: 16000 });
                audioContextRef.current = audioContext;

                const source = audioContext.createMediaStreamSource(stream);
                const processor = audioContext.createScriptProcessor(4096, 1, 1);
                processorRef.current = processor;

                // Create a silent gain node to keep processor active without feedback
                const gainNode = audioContext.createGain();
                gainNode.gain.value = 0; // Mute the output to prevent feedback

                source.connect(processor);
                processor.connect(gainNode);
                gainNode.connect(audioContext.destination);

                processor.onaudioprocess = (e) => {
                    // Don't send audio if AI is speaking (prevents feedback loop) or if mic is muted
                    if (socket.readyState === WebSocket.OPEN && !isSpeakingRef.current && isMicOnRef.current) {
                        const inputData = e.inputBuffer.getChannelData(0);
                        const pcmData = new Int16Array(inputData.length);
                        
                        for (let i = 0; i < inputData.length; i++) {
                            const s = Math.max(-1, Math.min(1, inputData[i]));
                            pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
                        }
                        
                        // Send raw PCM audio data directly (as in the sample code)
                        socket.send(pcmData.buffer);
                    }
                };

                console.log("Transcription started");
            } catch (error) {
                console.error("Error setting up transcription:", error);
            }
        };

        startTranscription();

        // Cleanup only on unmount
        return () => {
            if (socketRef.current) {
                if (socketRef.current.readyState === WebSocket.OPEN) {
                    socketRef.current.send(JSON.stringify({ type: "Terminate" }));
                }
                socketRef.current.close();
            }
            if (processorRef.current) {
                processorRef.current.disconnect();
            }
            if (audioContextRef.current) {
                audioContextRef.current.close().catch(console.error);
            }
            if (mediaStreamRef.current) {
                mediaStreamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, [isLoadingDetails, interviewDetails]); // Start when interview details are loaded

    if (isLoadingDetails) {
        return (
            <div className="p-1 h-full w-full bg-sidebar">
                <div className="flex flex-col h-full w-full bg-white rounded-xl border border-gray-200 overflow-hidden items-center justify-center">
                    <div className="text-center">
                        <p className="text-lg font-medium">Loading interview details...</p>
                        <p className="text-sm text-gray-500 mt-2">Please wait while we prepare your interview</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!interviewDetails) {
        return (
            <div className="p-1 h-full w-full bg-sidebar">
                <div className="flex flex-col h-full w-full bg-white rounded-xl border border-gray-200 overflow-hidden items-center justify-center">
                    <div className="text-center">
                        <p className="text-lg font-medium text-red-600">Failed to load interview details</p>
                        <p className="text-sm text-gray-500 mt-2">Please try again later</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-1 h-full w-full bg-sidebar">
            <div className="flex flex-col h-full w-full bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="flex w-full min-h-[40px]">
                    <div className="flex w-[80%] items-center justify-between border-b border-gray-200 px-2 py-2 gap-2">
                    <div className="flex gap-2">
                        <p className="text-sm">
                            <span className="font-semibold">Practice Interview</span> / {interviewDetails.jobTitle}
                        </p>
                        <div className="flex items-center justify-center gap-1 border-[1px] border-gray-400 rounded-md p-[2px]">
                            <Disc2 size={10} className="text-red-500 animate-[ping_1s_ease-in-out_infinite]" />
                            <span className="text-[8px]">Live</span>
                        </div>
                    </div>
                    <span className="text-[14px] font-medium">
                        12:00
                    </span>
                </div>
                <div className="flex w-[20%] justify-between items-center bg-accent">
                    <div className="text-sm font-medium flex-1 h-full border-1 items-center flex justify-start px-2">
                        <span>Script</span>
                    </div>
                </div>
            </div>

            <div className="flex w-full h-full">
                <div className="flex flex-col w-[80%] justify-center items-center p-4 overflow-y-auto">
                    <div className="flex-1 flex gap-1 w-full items-center">
                        <div className={`flex flex-col w-[50%] bg-gray-100 h-[400px] rounded-lg p-2 transition-all ${isSpeaking ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}>
                            <div className="flex-1 flex justify-center items-center relative">
                                <Avatar />
                                {isSpeaking && (
                                    <div className="absolute bottom-2 flex gap-1">
                                        <div className="w-1 h-4 bg-blue-500 animate-pulse" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-1 h-6 bg-blue-500 animate-pulse" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-1 h-4 bg-blue-500 animate-pulse" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-between items-center text-black text-[14px] font-medium">
                                <span>AI Interviewer</span>
                                {isSpeaking ? (
                                    <Mic size={15} className="text-blue-500 animate-pulse" />
                                ) : (
                                    <MicOff size={15} />
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col w-[50%] bg-gray-100 h-[400px] rounded-lg p-2 relative">
                            <div className="absolute inset-0 z-0">
                                {isVideoOn ? (
                                    <video 
                                        ref={videoRef} 
                                        autoPlay 
                                        playsInline 
                                        muted 
                                        className="w-full h-full object-cover rounded-md"
                                    />
                                ) : (
                                    <div className="w-full h-full flex justify-center items-center">
                                        <Avatar />
                                    </div>
                                )}
                            </div>
                            <div className={`flex justify-between items-center text-[14px] font-medium mt-auto z-10 rounded-md px-2 py-1 ${isVideoOn ? "text-white" : "text-black"}`}>
                                <span className="font-semibold">You</span>
                                <div>
                                    {!isMicOn ? <MicOff size={15} /> : <Mic size={15} />}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="absolute bottom-4 flex gap-4 justify-start items-center">
                        <Button variant={!isMicOn ? "destructive" : "secondary"} onClick={handleMicClick}>
                            {!isMicOn ? <MicOff /> : <Mic />}
                        </Button>
                        <Button variant={!isVideoOn ? "destructive" : "secondary"} onClick={handleVideoClick}>
                            {!isVideoOn ? <VideoOff /> : <Video />}
                        </Button>
                        <Button variant={isCaptionsOn ? "destructive" : "secondary"} onClick={handleCaptionsClick}>
                            {isCaptionsOn ? <CaptionsOff /> : <Captions />}
                        </Button>
                        <Button 
                            variant="destructive" 
                            onClick={handleEndInterview}
                            disabled={isEndingInterview}
                        >
                            {isEndingInterview ? (
                                <span className="text-sm">Ending...</span>
                            ) : (
                                <PhoneOff />
                            )}
                        </Button>
                    </div>
                </div>
                <div className="flex w-[20%] justify-center items-start max-h-full bg-accent">
                    <div 
                        ref={transcriptContainerRef}
                        className="flex flex-col gap-6 w-full px-4 pt-4 overflow-y-scroll max-h-full pb-12"
                    >
                        {transcripts.length === 0 ? (
                            <div className="text-sm text-gray-500 text-center mt-4">
                                Start speaking to see transcriptions...
                            </div>
                        ) : (
                            transcripts.map((transcript, index) => (
                                transcript.isUser ? (
                                    <UserMsg key={index} text={transcript.text} timestamp={transcript.timestamp} />
                                ) : (
                                    <AiMsg key={index} text={transcript.text} timestamp={transcript.timestamp} />
                                )
                            ))
                        )}
                    </div>
                </div>
            </div>
            </div>
        </div>
    )
}

export default InterviewPage;

function UserMsg({ text, timestamp }: { text: string; timestamp: string }) {
    return <div className="flex flex-col justify-start items-end w-full border-gray-200 w-full">
        <div className="flex gap-1 font-[400] text-[12px] text-gray-600 items-end">
            <span>{timestamp}</span>
            <span>•</span>
            <span className="text-black font-bold">You</span>
        </div>
        <span className="text-[14px] text-gray-600 font-[400] text-wrap text-right">
            {text}
        </span>
    </div>;
}

function AiMsg({ text, timestamp }: { text: string; timestamp: string }) {
    return <div className="flex flex-col justify-start items-start w-full border-gray-200">
        <div className="flex gap-1 font-[400] text-[12px] text-gray-600 items-center">
            <span className="font-[600]">AI Bot</span>
            <span>•</span>
            <span>{timestamp}</span>
        </div>
        <span className="text-[14px] text-gray-600 font-[400] text-wrap text-left">
            {text}
        </span>
    </div>;
}
