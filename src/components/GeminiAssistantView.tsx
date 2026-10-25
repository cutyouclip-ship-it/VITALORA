import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Upload,
  FileText,
  AlertCircle,
  CheckCircle2,
  PhoneCall,
  ArrowRight,
  Bot,
  User,
  Wrench,
  Languages,
  Shield,
  Loader2,
  FileCheck,
} from 'lucide-react';
import { ChatMessage, ActiveTab } from '../types.js';

interface Props {
  onNavigateToTab: (tab: ActiveTab) => void;
  initialPrompt?: string;
}

export const GeminiAssistantView: React.FC<Props> = ({ onNavigateToTab, initialPrompt }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'model',
      content: `Namaste! I am your Vitalora Clinical Assistant (क्लिनिकल स्वास्थ्य सहायक).
I can assist you fluently in English, हिन्दी (Hindi), or Hinglish.

• Real-time blood bank inquiries across Bihar (Patna, Gaya, Muzaffarpur, etc.)
• Understanding medical & lab reports in plain language
• Finding verified doctors, OPD appointments & hospital ICU beds
• Medicine indications, precautions & dosage guidelines

How can I help you today? (आपकी स्वास्थ्य सहायता कैसे करूँ?)`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [reportModalOpen, setReportModalOpen] = useState<boolean>(false);
  const [reportText, setReportText] = useState<string>('');
  const [reportImageBase64, setReportImageBase64] = useState<string | null>(null);
  const [isAnalyzingReport, setIsAnalyzingReport] = useState<boolean>(false);
  const [reportAnalysisResult, setReportAnalysisResult] = useState<any | null>(null);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, isLoading]);

  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      handleSendMessage(initialPrompt);
    }
  }, [initialPrompt]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          role: 'model',
          content: data.answer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          toolCalls: data.toolCalls,
          navigationActions: data.navigationActions,
        };
        setMessages(prev => [...prev, botMsg]);
      } else {
        const errorMsg: ChatMessage = {
          id: `err-${Date.now()}`,
          role: 'model',
          content: `Apologies, I encountered an issue: ${data.error || 'Server error'}. Please verify system credentials or try again.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, errorMsg]);
      }
    } catch (e: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'model',
          content: `Network connection error: ${e.message}. Please check your connection.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setReportImageBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyzeReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportText && !reportImageBase64) return;

    setIsAnalyzingReport(true);
    setReportAnalysisResult(null);

    try {
      const res = await fetch('/api/gemini/analyze-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportText,
          imageBase64: reportImageBase64,
        }),
      });

      const data = await res.json();
      if (res.ok && data.analysis) {
        setReportAnalysisResult(data.analysis);
        const reportSummaryMsg: ChatMessage = {
          id: `rep-${Date.now()}`,
          role: 'model',
          content: `### 📋 Diagnostic Analysis: ${data.analysis.reportTitle || 'Medical Report'}\n\n${data.analysis.overallSummaryEnglish}\n\n**हिन्दी व्याख्या:**\n${data.analysis.overallSummaryHindi || ''}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          reportAnalysis: data.analysis,
        };
        setMessages(prev => [...prev, reportSummaryMsg]);
      } else {
        alert(data.error || 'Failed to analyze report');
      }
    } catch (err: any) {
      alert(`Error analyzing report: ${err.message}`);
    } finally {
      setIsAnalyzingReport(false);
    }
  };

  const quickPrompts = [
    { label: 'O- Negative Blood in Patna', prompt: 'Patna ke aas-paas O-negative blood kahan available hai?' },
    { label: 'Cardiologist at AIIMS Patna', prompt: 'AIIMS Patna mein best cardiology doctors kaun hain aur unki OPD timing kya hai?' },
    { label: 'Explain Fasting Glucose 128', prompt: 'Mere lab report mein Fasting Blood Glucose 128 mg/dL aaya hai, iska kya arth hai?' },
    { label: 'Ayushman PM-JAY Cashless', prompt: 'Ayushman Bharat card se Patna mein kaun se hospitals impaneled hain?' },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col h-[760px] rounded-3xl glass border border-border shadow-glass overflow-hidden relative">
      {/* Top Header */}
      <div className="p-4 px-6 bg-muted/30 border-b border-border flex items-center justify-between z-10 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gold shadow-gold flex items-center justify-center text-primary-foreground font-black">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-white tracking-tight">Vitalora AI Clinical Assistant</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-muted text-primary border border-border">
                Gemini 3.8 Flash • Real-Time Tools
              </span>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
              <Languages className="w-3.5 h-3.5 text-primary" />
              Fluent in English, हिन्दी (Hindi) & Hinglish
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setReportAnalysisResult(null);
              setReportModalOpen(true);
            }}
            className="text-xs px-3.5 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground border border-border flex items-center gap-1.5 transition-all font-medium cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-primary" />
            Analyze Lab Report
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-6 space-y-5">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex items-start gap-3.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                msg.role === 'user'
                  ? 'bg-gold text-primary-foreground shadow-gold font-bold'
                  : 'bg-muted text-primary border border-border'
              }`}
            >
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-primary" />}
            </div>

            {/* Bubble */}
            <div className={`max-w-[82%] space-y-2`}>
              <div
                className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-gold text-primary-foreground rounded-tr-none font-medium'
                    : 'glass text-foreground border border-border/80 rounded-tl-none whitespace-pre-wrap'
                }`}
              >
                {msg.content}

                {/* If tool calls executed, render transparent tool execution box */}
                {msg.toolCalls && msg.toolCalls.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border/60 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-primary">
                      <Wrench className="w-3.5 h-3.5" />
                      Executed Verified Internal Tool:
                    </div>
                    {msg.toolCalls.map((tc, idx) => (
                      <div key={idx} className="p-2 rounded-xl bg-background/50 border border-border text-[11px] font-mono text-muted-foreground">
                        <span className="text-primary font-semibold">{tc.name}()</span>
                        <span className="text-muted-foreground ml-2">with params: {JSON.stringify(tc.args)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* If lab report breakdown attached */}
                {msg.reportAnalysis && (
                  <div className="mt-3 pt-3 border-t border-border space-y-2">
                    <div className="text-xs font-bold text-primary">Extracted Lab Parameters:</div>
                    <div className="space-y-1.5">
                      {msg.reportAnalysis.patientIndicators?.map((ind: any, i: number) => (
                        <div key={i} className="p-2 rounded-xl bg-background/50 border border-border flex items-center justify-between text-xs">
                          <div>
                            <span className="font-semibold text-white">{ind.parameter}</span>
                            <span className="text-muted-foreground ml-2">({ind.observedValue})</span>
                            <div className="text-[10px] text-muted-foreground">Ref: {ind.referenceRange}</div>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                              ind.status === 'CRITICAL'
                                ? 'bg-destructive/20 text-destructive border border-destructive/40'
                                : ind.status === 'ELEVATED' || ind.status === 'LOW'
                                ? 'bg-amber-950/60 text-amber-300 border border-amber-800'
                                : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
                            }`}
                          >
                            {ind.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation suggestions buttons */}
              {msg.navigationActions && msg.navigationActions.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {msg.navigationActions.map(action => {
                    let label = '';
                    let tab: ActiveTab = 'assistant';
                    if (action === 'blood-band') {
                      label = 'Open Bihar Blood Band';
                      tab = 'blood-band';
                    } else if (action === 'doctors') {
                      label = 'View Doctors & Book OPD';
                      tab = 'doctors';
                    } else if (action === 'pharmacy') {
                      label = 'Open Pharmacy Catalog';
                      tab = 'pharmacy';
                    } else if (action === 'records') {
                      label = 'Open Health Records Vault';
                      tab = 'records';
                    } else if (action === 'anatomy') {
                      label = 'Inspect 3D Anatomy Model';
                      tab = 'anatomy';
                    } else if (action === 'insurance') {
                      label = 'View Ayushman PM-JAY Policies';
                      tab = 'insurance';
                    }
                    if (!label) return null;

                    return (
                      <button
                        key={action}
                        onClick={() => onNavigateToTab(tab)}
                        className="text-xs px-3.5 py-1.5 rounded-xl bg-gold font-medium text-primary-foreground shadow-gold flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
                      >
                        {label} <ArrowRight className="w-3 h-3" />
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="text-[10px] text-muted-foreground font-mono px-1">{msg.timestamp}</div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-muted text-primary border border-border flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl glass border border-border text-xs text-muted-foreground flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span>Checking verified medical ledger & consulting clinical knowledge base...</span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Prompts Bar */}
      <div className="p-2 px-4 bg-muted/20 border-t border-border flex items-center gap-2 overflow-x-auto">
        <span className="text-[11px] text-muted-foreground font-medium whitespace-nowrap">Suggested:</span>
        {quickPrompts.map(qp => (
          <button
            key={qp.label}
            onClick={() => handleSendMessage(qp.prompt)}
            className="text-[11px] px-3 py-1 rounded-full bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground border border-border whitespace-nowrap transition-all cursor-pointer"
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Input Composer Bar */}
      <div className="p-4 bg-muted/30 border-t border-border flex items-center gap-3 backdrop-blur-md">
        <input
          type="text"
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
          placeholder="Ask in Hindi, English or Hinglish (e.g. Patna mein O- blood kahan milega?)..."
          className="flex-1 py-3 px-4 rounded-xl bg-background/60 border border-input text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-all"
        />

        <button
          onClick={() => handleSendMessage()}
          disabled={!inputText.trim() || isLoading}
          className="p-3 rounded-xl bg-gold text-primary-foreground font-bold shadow-gold disabled:opacity-50 disabled:cursor-not-allowed transition-transform active:scale-95 cursor-pointer"
          title="Send consultation message"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {/* Lab Report Analysis Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-3xl glass border border-border p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setReportModalOpen(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-white text-lg font-bold cursor-pointer"
            >
              ×
            </button>

            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wider">
                <FileCheck className="w-4 h-4 text-primary" />
                Gemini Vision Diagnostic Report Analyzer
              </div>
              <h3 className="text-xl font-bold text-white mt-1">Upload Medical & Lab Report</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Upload a blood test photo (CBC, Lipid Panel, Blood Glucose) or paste report text to get bilingual clinical explanations.
              </p>
            </div>

            <form onSubmit={handleAnalyzeReportSubmit} className="space-y-4 text-xs">
              <div className="p-6 rounded-2xl bg-background/50 border border-dashed border-border text-center space-y-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2.5 rounded-xl bg-gold text-primary-foreground font-semibold shadow-gold inline-flex items-center gap-2 cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  Select Report Photo
                </button>
                {reportImageBase64 ? (
                  <div className="text-primary font-semibold flex items-center justify-center gap-1 pt-1">
                    <CheckCircle2 className="w-4 h-4" /> Image selected and processed
                  </div>
                ) : (
                  <p className="text-muted-foreground text-[11px]">Supports JPEG, PNG photos of diagnostic test reports</p>
                )}
              </div>

              <div>
                <label className="text-muted-foreground font-medium block mb-1">
                  Or Paste Diagnostic Test Values / Report Text:
                </label>
                <textarea
                  rows={4}
                  value={reportText}
                  onChange={e => setReportText(e.target.value)}
                  placeholder="e.g. Fasting Glucose: 135 mg/dL, HbA1c: 6.8%, Total Cholesterol: 220 mg/dL, Triglycerides: 180 mg/dL..."
                  className="w-full p-3 rounded-xl bg-background/60 border border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-muted/40 border border-border text-xs text-muted-foreground flex items-center gap-2">
                <Shield className="w-4 h-4 shrink-0 text-primary" />
                <span>
                  Privacy Safeguard: Uploaded diagnostic data is processed ephemerally on server-side and never used to train public models.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReportModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-muted text-muted-foreground hover:text-white cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isAnalyzingReport || (!reportText && !reportImageBase64)}
                  className="px-5 py-2.5 rounded-xl bg-gold text-primary-foreground font-semibold shadow-gold flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isAnalyzingReport ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing with Gemini...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Run Clinical Analysis
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
