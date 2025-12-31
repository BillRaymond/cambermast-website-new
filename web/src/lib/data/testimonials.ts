export type Testimonial = {
  id: string;
  programSku: string;
  programSlug: string;
  programRoute: string;
  displayName: string;
  jobTitle?: string;
  company?: string;
  rating: number;
  quote: string;
  allowPublicUse: boolean;
  featured?: boolean;
  source?: string;
  createdAt: string;
};

export const testimonials: Testimonial[] = [
  // existing testimonials...
  {
    id: "tm-cm-tr-002-004",
    programSku: "CM-TR-002",
    programSlug: "ai-accelerator-workshop",
    programRoute: "/programs/ai-accelerator-workshop",
    displayName: "Bill R.",
    jobTitle: "Director of Enablement",
    company: "Northwind Robotics",
    rating: 5,
    quote: "The accelerator gave our go-to-market team a shared AI language and weekly labs that translated straight into reusable workflows. We left with templates that saved us hours the following sprint.",
    allowPublicUse: true,
    createdAt: "2025-12-31T01:20:35.910Z",
  },
];
