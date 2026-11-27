import { notFound } from "next/navigation";
import { SydneyPpiServiceDetail } from "@/components/sydney-pre-purchase/SydneyPpiServiceDetail";
import {
  getSydneyPpiService,
  listSydneyPpiServiceSlugs,
} from "@/lib/pre-purchase/sydney-ppi-services";

export function generateStaticParams() {
  return listSydneyPpiServiceSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getSydneyPpiService(slug);
  if (!service) return {};
  return {
    title: `${service.heading} | Auto Verifi Sydney`,
    description: service.card,
  };
}

export default async function SydneyPpiServiceRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getSydneyPpiService(slug);
  if (!service) notFound();
  return <SydneyPpiServiceDetail service={service} />;
}