import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { WORKFLOW_STEPS, type WorkflowStep } from "@/types";

export function ProjectStepper({ current }: { current: WorkflowStep }) {
  const currentIndex = WORKFLOW_STEPS.findIndex((step) => step.key === current);

  return (
    <div className="overflow-x-auto pb-2">
      <ol className="flex min-w-[720px] items-start">
        {WORKFLOW_STEPS.map((step, index) => {
          const done = index < currentIndex;
          const active = index === currentIndex;
          return (
            <li key={step.key} className="flex flex-1 items-start">
              <div className="flex w-full flex-col items-center text-center">
                <div className="flex w-full items-center">
                  <div className={cn("h-px flex-1", index === 0 ? "bg-transparent" : done || active ? "bg-primary" : "bg-border")} />
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                      done && "border-primary bg-primary text-primary-foreground",
                      active && "border-accent bg-accent text-accent-foreground",
                      !done && !active && "border-border bg-background text-muted-foreground",
                    )}
                  >
                    {done ? <Check className="h-4 w-4" /> : index + 1}
                  </div>
                  <div className={cn("h-px flex-1", index === WORKFLOW_STEPS.length - 1 ? "bg-transparent" : done ? "bg-primary" : "bg-border")} />
                </div>
                <p className={cn("mt-2 text-xs font-medium", active ? "text-accent" : "text-foreground")}>
                  {step.label}
                </p>
                <p className="text-[10px] text-muted-foreground">{step.malay}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
