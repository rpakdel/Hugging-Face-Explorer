import { ModelRunner } from "@/components/model-runner";
import { HistoryList } from "@/components/history-list";
import { BrainCircuit, Cpu, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50/50">
      
      {/* Hero Section */}
      <section className="relative bg-white border-b border-border/40 overflow-hidden pb-12 pt-16 md:pt-24 md:pb-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        <div className="container relative mx-auto px-4 max-w-6xl">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20 mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Running client-side with WebAssembly
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 font-display">
              Transformer <span className="text-primary">Playground</span>
            </h1>
            
            <p className="text-xl text-slate-600 leading-relaxed">
              Run state-of-the-art machine learning models directly in your browser. 
              No backend inference required. Powered by <code className="bg-slate-100 px-2 py-1 rounded text-primary font-mono text-base">@xenova/transformers</code>.
            </p>

            <div className="flex justify-center gap-8 pt-4 text-sm text-slate-500 font-medium">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-purple-500" />
                <span>Neural Networks</span>
              </div>
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-blue-500" />
                <span>WebAssembly</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                <span>Real-time</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 max-w-6xl space-y-20">
        
        {/* Playground Area */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <div className="w-1 h-8 bg-primary rounded-full"></div>
              Playground
            </h2>
          </div>
          <ModelRunner />
        </section>

        {/* History Section */}
        <section>
           <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <div className="w-1 h-8 bg-slate-400 rounded-full"></div>
              Recent Experiments
            </h2>
          </div>
          <HistoryList />
        </section>

        {/* About/Footer */}
        <footer className="border-t border-border pt-12 pb-8 text-center text-slate-500">
          <p className="mb-4">
            Built with React, Tailwind CSS, and Transformers.js
          </p>
          <p className="text-sm max-w-2xl mx-auto leading-relaxed">
            This demo downloads quantized models to your browser cache on the first run. 
            Subsequent runs are nearly instantaneous. 
            All inference happens locally on your device.
          </p>
        </footer>

      </div>
    </div>
  );
}
