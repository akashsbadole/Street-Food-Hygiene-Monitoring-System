import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { parseImageUrl } from "@/lib/utils";
import HygieneReportCard from "@/components/HygieneReport";

const ImageViewer = () => {
  const { imageId } = useParams();
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const response = await fetch(
          `http://localhost:8081/api/getAnalysis?path=/images/${imageId}`
        );
        if (response.ok) {
          const data = await response.json();
          setAnalysisData(data);
        }
      } catch (error) {
        console.error("Error fetching analysis:", error);
      } finally {
        setLoading(false);
      }
    };

    if (imageId) {
      fetchAnalysis();
    }
  }, [imageId]);

  if (loading) return <div>Loading...</div>;
  if (!analysisData) return <div>Analysis not found</div>;

  return (
    <div className="container mx-auto py-8">
      <HygieneReportCard
        report={analysisData.analysisResult}
        originalImage={analysisData.imageUrl}
        hygieneIssues={analysisData.analysisResult.hygieneIssues}
      />
    </div>
  );
};

export default ImageViewer;
