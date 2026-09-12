import { notFound, redirect } from "next/navigation";
import { TOOLS_REGISTRY } from "@/lib/tools-data";

interface Props {
  params: {
    slug: string;
  };
}

export function generateStaticParams() {
  return TOOLS_REGISTRY.map((t) => ({
    slug: t.slug,
  }));
}

export default function DynamicToolPage({ params }: Props) {
  const tool = TOOLS_REGISTRY.find((t) => t.slug === params.slug);

  if (!tool) {
    notFound();
  }

  // Redirect to the dedicated tool page
  redirect(`/tools/${tool.slug}`);
}
