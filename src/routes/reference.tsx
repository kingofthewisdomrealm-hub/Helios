import { createFileRoute } from "@tanstack/react-router";
import { ReferencePage } from "@/components/solar/ReferencePage";

export const Route = createFileRoute("/reference")({
  component: ReferencePage,
  head: () => ({
    meta: [{ title: "Helios — Reference" }],
  }),
});
