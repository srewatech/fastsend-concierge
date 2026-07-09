import { createFileRoute } from "@tanstack/react-router";
import { Wizard } from "@/features/wizard/Wizard";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return <Wizard />;
}
