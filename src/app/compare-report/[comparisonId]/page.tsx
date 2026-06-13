import { CompareReportDocument } from "@/components/compare-report-document";

type CompareReportPageProps = {
  params: Promise<{
    comparisonId: string;
  }>;
};

export default async function CompareReportPage({ params }: CompareReportPageProps) {
  const { comparisonId } = await params;
  return <CompareReportDocument comparisonId={comparisonId} />;
}
