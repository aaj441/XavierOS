import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/projects/")({
  component: () => <Navigate to="/dashboard" />,
});
