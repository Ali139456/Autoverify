import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SolutionAudiencePage } from "@/components/solutions/SolutionAudiencePage";
import {
  getSolutionPage,
  SOLUTION_PAGES,
} from "@/content/solution-pages";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return SOLUTION_PAGES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = getSolutionPage(slug);
  if (!page) return {};
  return {
    title: `${page.title} — Auto Verifi`,
    description: page.metaDescription,
  };
}

export default async function SolutionSlugPage({ params }: Props) {
  const { slug } = await params;
  const page = getSolutionPage(slug);
  if (!page) notFound();
  return <SolutionAudiencePage page={page} />;
}
