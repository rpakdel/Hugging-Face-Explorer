import { useOperations } from "@/hooks/use-operations";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { Activity, Type, FileText, AlignLeft, Sparkles } from "lucide-react";

const icons = {
  "sentiment-analysis": Activity,
  "text-generation": Type,
  "summarization": FileText,
  "translation_en_to_fr": AlignLeft,
};

export function HistoryList() {
  const { data: operations, isLoading } = useOperations();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 rounded-2xl bg-muted/50 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!operations?.length) {
    return (
      <div className="text-center py-16 px-4 bg-muted/30 rounded-3xl border border-dashed border-muted-foreground/20">
        <div className="bg-primary/5 p-4 rounded-full w-fit mx-auto mb-4">
          <Sparkles className="w-8 h-8 text-primary/50" />
        </div>
        <h3 className="text-xl font-semibold text-foreground">No experiments yet</h3>
        <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
          Run your first model above to see it appear in your history log.
        </p>
      </div>
    );
  }

  // Sort by newest first
  const sortedOperations = [...operations].sort((a, b) => {
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <AnimatePresence mode="popLayout">
        {sortedOperations.map((op) => {
          const Icon = icons[op.task as keyof typeof icons] || Sparkles;
          
          return (
            <motion.div
              key={op.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="group bg-card hover:bg-card/80 border border-border/50 hover:border-primary/20 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-mono font-medium text-muted-foreground uppercase tracking-wider">
                    {op.task.replace(/_/g, " ")}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {op.createdAt && formatDistanceToNow(new Date(op.createdAt), { addSuffix: true })}
                </span>
              </div>

              <div className="space-y-4 flex-1">
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-1">Input</h4>
                  <p className="text-sm text-foreground/80 line-clamp-2 font-medium">
                    "{op.input}"
                  </p>
                </div>
                
                <div className="pt-4 border-t border-border/50 mt-auto">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Output</h4>
                  <div className="bg-muted/50 rounded-lg p-3 font-mono text-xs text-foreground overflow-x-auto">
                    {JSON.stringify(op.output, null, 2)}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
