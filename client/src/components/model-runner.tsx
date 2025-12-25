import { useState, useEffect, useRef } from "react";
import { pipeline } from "@xenova/transformers";
import { useCreateOperation } from "@/hooks/use-operations";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Play, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { LoadingDots } from "@/components/ui/loading-dots";

const TASK_OPTIONS = [
  { value: "sentiment-analysis", label: "Sentiment Analysis", description: "Detect positive or negative emotion" },
  { value: "text-generation", label: "Text Generation", description: "Complete a sentence or phrase" },
  { value: "summarization", label: "Summarization", description: "Condense long text into a summary" },
  { value: "translation_en_to_fr", label: "Translation (En → Fr)", description: "Translate English text to French" },
];

export function ModelRunner() {
  const [task, setTask] = useState<string>("sentiment-analysis");
  const [input, setInput] = useState<string>("");
  const [output, setOutput] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [modelStatus, setModelStatus] = useState<string>("");
  const [progress, setProgress] = useState<number | null>(null);
  
  const workerRef = useRef<any>(null);
  const { toast } = useToast();
  const createOperation = useCreateOperation();

  // Reset output when task changes
  useEffect(() => {
    setOutput(null);
    setInput("");
  }, [task]);

  const runModel = async () => {
    if (!input.trim()) {
      toast({
        title: "Input required",
        description: "Please enter some text to process.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setModelStatus("Loading model (this happens once)...");
    setOutput(null);
    setProgress(0);

    try {
      // Dynamic import to ensure it runs client-side only and compatible with vite
      // In a real production app, we might move this to a Web Worker to avoid blocking UI
      // For this demo, we'll run it in main thread but be careful
      
      const pipe = await pipeline(task as any, undefined, {
        progress_callback: (x: any) => {
          if (x.status === "progress") {
            setProgress(Math.round(x.progress || 0));
          }
        }
      });

      setModelStatus("Processing...");
      
      // Different parameters based on task
      let result;
      if (task === "text-generation") {
        result = await pipe(input, { max_new_tokens: 50 } as any);
      } else {
        result = await pipe(input);
      }
      
      setOutput(result);
      
      // Save history
      createOperation.mutate({
        task,
        input,
        output: result,
      });

      toast({
        title: "Success!",
        description: "Model finished processing.",
      });
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Error running model",
        description: err.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setModelStatus("");
      setProgress(null);
    }
  };

  const renderOutput = () => {
    if (!output) return null;

    if (task === "sentiment-analysis" && Array.isArray(output)) {
      const { label, score } = output[0];
      const isPositive = label === "POSITIVE";
      return (
        <div className="flex items-center gap-4">
          <Badge className={`text-lg px-4 py-2 ${isPositive ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}>
            {label}
          </Badge>
          <span className="font-mono text-muted-foreground">Confidence: {(score * 100).toFixed(1)}%</span>
        </div>
      );
    }

    if (task === "text-generation" && Array.isArray(output)) {
      return (
        <p className="text-lg leading-relaxed font-medium">
          {output[0].generated_text}
        </p>
      );
    }

    if (task === "summarization" && Array.isArray(output)) {
      return (
        <p className="text-lg leading-relaxed font-medium">
          {output[0].summary_text}
        </p>
      );
    }

    if (task === "translation_en_to_fr" && Array.isArray(output)) {
      return (
        <p className="text-lg leading-relaxed font-medium">
          {output[0].translation_text}
        </p>
      );
    }

    return (
      <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
        {JSON.stringify(output, null, 2)}
      </pre>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      
      {/* Configuration Card */}
      <div className="bg-card rounded-2xl shadow-xl border border-border/50 overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-purple-500 to-pink-500" />
        
        <div className="p-6 md:p-8 space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/3 space-y-2">
              <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Select Task</label>
              <Select value={task} onValueChange={setTask} disabled={isProcessing}>
                <SelectTrigger className="h-12 text-lg">
                  <SelectValue placeholder="Select a task" />
                </SelectTrigger>
                <SelectContent>
                  {TASK_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-2">
                {TASK_OPTIONS.find(t => t.value === task)?.description}
              </p>
            </div>

            <div className="w-full md:w-2/3 space-y-2">
              <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Input Text</label>
              <Textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={task === 'text-generation' ? "Once upon a time..." : "Enter text here..."}
                className="min-h-[120px] text-base resize-none focus-visible:ring-primary/30"
                disabled={isProcessing}
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button 
              size="lg" 
              onClick={runModel} 
              disabled={isProcessing || !input}
              className="bg-primary hover:bg-primary/90 text-white font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-95 text-lg px-8 h-12 rounded-xl"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-5 w-5 fill-current" />
                  Run Model
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Progress Bar for Model Loading */}
        {isProcessing && progress !== null && (
          <div className="px-8 pb-8">
            <div className="flex justify-between text-xs text-muted-foreground mb-2 font-mono">
              <span>{modelStatus}</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.2 }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Output Section */}
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-[100px]"
      >
        {isProcessing ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4 text-muted-foreground">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
              <Wand2 className="w-12 h-12 relative z-10 animate-pulse text-primary" />
            </div>
            <p className="font-mono text-sm animate-pulse">{modelStatus}</p>
          </div>
        ) : output ? (
          <div className="bg-card rounded-2xl shadow-lg border border-border/50 p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
              <div className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
                OUTPUT
              </div>
            </div>
            <div className="prose prose-lg dark:prose-invert max-w-none">
              {renderOutput()}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-border rounded-2xl text-muted-foreground">
            <p>Run a model to see results here</p>
          </div>
        )}
      </motion.div>

    </div>
  );
}
