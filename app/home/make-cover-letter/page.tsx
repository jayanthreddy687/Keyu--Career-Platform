'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import Image from 'next/image';
import { Send, Download, FileText, Loader2 } from 'lucide-react';
import EmptyStateArrow from "@/app/assets/svgs/make-resume-empty-state-arrow.svg";
import EmptyStateLogo from "@/app/assets/svgs/make-resume-empty-state-logo.svg";
import DocViewer from '@/components/DocViewer';

// SVG Icons
const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 10V12.6667C14 13.0203 13.8595 13.3594 13.6095 13.6095C13.3594 13.8595 13.0203 14 12.6667 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V10M4.66667 6.66667L8 10M8 10L11.3333 6.66667M8 10V2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface CoverLetterDocument {
  content: string;
  sections: {
    header: string;
    body: string;
    closing: string;
  };
}

export default function MakeCoverLetterPage() {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [coverLetterDocument, setCoverLetterDocument] = useState<CoverLetterDocument>({
    content: '',
    sections: {
      header: '',
      body: '',
      closing: ''
    }
  });
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [inputRows, setInputRows] = useState(1);
  const maxRows = 5;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const downloadMenuRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Close download menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (downloadMenuRef.current && !downloadMenuRef.current.contains(event.target as Node)) {
        setShowDownloadMenu(false);
      }
    };

    // Only add event listener on client side
    if (typeof window !== 'undefined') {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, []);

  const downloadDocument = (format: 'pdf') => {
    if (typeof window === 'undefined') return;
    
    if (!coverLetterDocument.content && !Object.values(coverLetterDocument.sections).some(section => section)) {
      alert('No content to download');
      return;
    }

    if (format === 'pdf') {
      // Create a new window with only the document content, no browser headers/footers
      const documentContent = coverLetterDocument.content || 
        `${coverLetterDocument.sections.header || ''}<br><br>${coverLetterDocument.sections.body || ''}<br><br>${coverLetterDocument.sections.closing || ''}`;
      
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Cover Letter</title>
              <style>
                @page {
                  margin: 0;
                  size: letter;
                }
                body { 
                  font-family: 'Times New Roman', serif; 
                  line-height: 1.6; 
                  margin: 0;
                  padding: 0;
                  max-width: 800px;
                  color: #000;
                }
                .cover-letter { 
                  margin: 0 auto; 
                  padding: 20px;
                }
                @media print {
                  body { 
                    margin: 0;
                    padding: 0;
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                  }
                  * {
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                  }
                }
              </style>
            </head>
            <body>
              <div class="cover-letter">
                ${documentContent}
              </div>
              <script>
                // Auto-print when page loads
                window.onload = function() {
                  setTimeout(function() {
                    window.print();
                    setTimeout(function() {
                      window.close();
                    }, 1000);
                  }, 250);
                };
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
    
    setShowDownloadMenu(false);
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: inputValue,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/cover-letter/v2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputValue,
          conversation_history: messages,
          conversation_id: conversationId,
          current_document: coverLetterDocument
        }),
      });

      const data = await response.json();
      console.log('API Response received:', data);

      if (response.ok) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.chat_response || 'I received your message but didn\'t have a response. Let me help you with your cover letter.',
          timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, assistantMessage]);
        setConversationId(data.conversation_id);
        
        // Update document if changes were made
        if (data.document_updates) {
          console.log('Updating document with:', data.document_updates);
          setCoverLetterDocument(data.document_updates);
        }
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="p-1 h-full w-full bg-sidebar">
      <div className="flex flex-col h-full w-full bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="flex w-full border-b border-gray-200">
          <div className="flex w-[75%] justify-between items-center px-2 h-12">
          <p className="text-sm"><span className="font-semibold">Make Cover Letter</span> / New Cover Letter</p>
          {/* Download menu */}
          <div className="flex justify-end p-2">
            <div className="relative" ref={downloadMenuRef}>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2 bg-white shadow-sm"
                onClick={() => setShowDownloadMenu(!showDownloadMenu)}
              >
                <Download className="w-4 h-4" />
                Download
                <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Button>
              
              {showDownloadMenu && (
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                  <div className="py-1">
                    <button
                      onClick={() => downloadDocument('pdf')}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <FileText className="w-4 h-4 mr-3" />
                      Download as PDF
                    </button>
                    {/* DOCX option removed */}
                  </div>
                </div>
              )}
            </div>
          </div>
          </div>
          <div className="flex w-[25%] justify-between items-center border-l border-gray-200 h-12">
            <div className="text-sm font-medium flex-1 h-full items-center flex justify-start px-2">
              <span>Chat with cover letter AI agent</span>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex w-full flex-1 overflow-auto">
          {/* Document viewer - 75% */}
          <div className="flex w-[75%] flex-col bg-primary overflow-auto">
          <div className="flex-1 flex justify-center items-start p-8 pt-4">
            <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full min-h-[600px]">
              {coverLetterDocument.content ? (
                <DocViewer 
                  htmlContent={coverLetterDocument.content}
                  onChangeHtml={(next) => setCoverLetterDocument(prev => ({
                    ...prev,
                    content: next
                  }))}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Image 
                    src="/empty-cv-state.svg" 
                    alt="Empty cover letter state" 
                    width={127} 
                    height={112} 
                    priority
                    className="mb-4 opacity-60"
                  />
                  <p className="text-sm font-medium text-gray-600">
                    Start chatting with AI to create your cover letter
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

          {/* Chat interface - 25% */}
          <div className="flex w-[25%] flex-col h-full border-l border-gray-200">
          <div className="flex-1 overflow-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="relative w-full mb-4">
                  <div className="absolute top-0 right-2 z-2">
                    <EmptyStateArrow />
                  </div>
                  <div className="flex justify-center mt-16">
                    <EmptyStateLogo />
                  </div>
                </div>
                <p className="text-sm text-center font-medium text-gray-600">
                  Start a conversation with AI to build your cover letter
                </p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-full px-3 py-2 rounded-lg text-xs ${
                    message.role === 'user' 
                      ? 'bg-primary text-white' 
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <div className="whitespace-pre-wrap break-words">
                      {message.content}
                    </div>
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-xs px-4 py-2 rounded-lg text-sm bg-gray-100 text-gray-800">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat input */}
          <div className="border-t border-gray-200 p-2">
            <div className="bg-white rounded-lg shadow-sm border border-[#E7E6E4] p-1.5">
              <div className="flex items-end gap-2">
                  <textarea
                    value={inputValue}
                    onChange={(e) => {
                      setInputValue(e.target.value);
                      // Auto-resize based on actual line breaks
                      const lineCount = (e.target.value.match(/\n/g) || []).length + 1;
                      setInputRows(Math.min(lineCount, maxRows));
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (inputValue.trim() && !isLoading) {
                          sendMessage();
                          // Reset rows after sending
                          setInputRows(1);
                        }
                      }
                    }}
                    placeholder="Chat with our cover letter AI agent..."
                    rows={inputRows}
                    className="flex-1 resize-none border-0 focus:outline-none focus:ring-0 bg-transparent text-xs placeholder:gray-500 overflow-y-auto min-h-[60px]"
                    disabled={isLoading}
                  />
                  <Button 
                     onClick={sendMessage}
                     size="sm"
                     disabled={!inputValue.trim() || isLoading}
                     className="rounded-md"
                   >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}