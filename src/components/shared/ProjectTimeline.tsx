import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { WORKFLOW_STEPS, type WorkflowStep } from "@/types";

export function ProjectTimeline({ current }: { current: WorkflowStep }) {
  const currentIndex = WORKFLOW_STEPS.findIndex((step) => step.key === current);

  return (
    <ol className="space-y-0">
      {WORKFLOW_STEPS.map((step, index) => {
        const done = index < currentIndex;
        const active = index === currentIndex;
        return (
          <li key={step.key} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold",
                  done && "border-primary bg-primary text-primary-foreground",
                  active && "border-accent bg-accent text-accent-foreground",
                  !done && !active && "border-border bg-muted text-muted-foreground",
                )}
              >
                {done ? <Check className="h-4 w-4" /> : index + 1}
              </div>
              {index < WORKFLOW_STEPS.length - 1 ? (
                <div className={cn("w-px flex-1 min-h-6", done ? "bg-primary" : "bg-border")} />
              ) : null}
            </div>
            <div className="pb-6">
              <p className={cn("text-sm font-medium", active && "text-accent")}>{step.label}</p>
              <p className="text-xs text-muted-foreground">{step.malay}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
