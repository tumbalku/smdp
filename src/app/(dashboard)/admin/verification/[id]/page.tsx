"use client";

import { useParams } from "next/navigation";
import { VerificationDetailView } from "@/features/verification/components/VerificationDetailView";

export default function VerificationDetailPage() {
  const params = useParams();
  const id = params.id as string;

  return <VerificationDetailView documentId={id} />;
}
