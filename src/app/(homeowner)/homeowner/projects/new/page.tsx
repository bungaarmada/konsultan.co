import { ProjectForm } from "@/components/homeowner/ProjectForm";

export default function NewProjectPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Homeowner portal</p>
        <h1 className="font-heading text-3xl text-primary">New project submission</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Capture owner details, pin the site, and upload geran, IC, and pelan tapak.
        </p>
      </div>
      <ProjectForm />
    </div>
  );
}
