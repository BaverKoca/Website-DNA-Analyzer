import { ReportDocument } from "@/components/report-document";

type ReportPageProps = {
  params: Promise<{
    analysisId: string;
  }>;
};

export default async function ReportPage({ params }: ReportPageProps) {
  const { analysisId } = await params;
  return <ReportDocument analysisId={analysisId} />;
}
