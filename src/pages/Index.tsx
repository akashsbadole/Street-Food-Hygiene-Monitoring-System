import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ImageUploader from "@/components/ImageUploader";
import HygieneReportCard, { HygieneReport } from "@/components/HygieneReport";
import { analyzeImage } from "@/services/analysisService";
import { Loader2 } from "lucide-react";
import { generateImageUrl } from "@/lib/utils";

const Index = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [report, setReport] = useState<HygieneReport | null>(null);
  const [activeTab, setActiveTab] = useState("upload");
  const [imageUrl, setImageUrl] = useState<string>("");
  const { toast } = useToast();

  const handleImageUploaded = (imageData: string) => {
    setUploadedImage(imageData);
    setReport(null);

    // Generate unique URL for the image
    const url = generateImageUrl(imageData);
    setImageUrl(url);

    // Update URL without page reload
    window.history.pushState({}, "", url);
  };

  const handleAnalyzeImage = async () => {
    if (!uploadedImage) {
      toast({
        title: "No image to analyze",
        description: "Please upload an image first",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await analyzeImage(uploadedImage);
      setReport(result);
      setActiveTab("report");

      const timestamp = new Date().toISOString();
      const path = imageUrl || `/images/${new Date().getTime()}`;

      const response = await fetch("http://localhost:8081/api/saveAnalysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl: uploadedImage,
          analysisResult: result,
          timestamp,
          path,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save analysis data");
      }

      toast({
        title: "Analysis Complete",
        description: "Your hygiene report is ready for review.",
      });
    } catch (error) {
      console.error("Error during analysis:", error);
      toast({
        title: "Analysis Failed",
        description:
          error instanceof Error
            ? error.message
            : "There was an error analyzing the image.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-street-yellow to-street-orange py-16">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-white">
                    Ensuring Health Safety in Street Food
                  </h1>
                  <p className="max-w-[600px] text-white md:text-xl">
                    Our AI-powered platform helps monitor and improve hygiene
                    standards among street food vendors, making street food
                    safer for everyone.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button
                    className="bg-white text-street-orange hover:bg-gray-100"
                    onClick={() =>
                      window.scrollTo({ top: 500, behavior: "smooth" })
                    }
                  >
                    Get Started
                  </Button>
                  <Button
                    variant="outline"
                    className="border-white text-black hover:bg-white/10"
                  >
                    Learn More
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-12">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-3xl space-y-8">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">
                  Analyze Vendor Hygiene
                </h2>
                <p className="text-muted-foreground">
                  Upload an image of a street food vendor to get an AI-powered
                  hygiene assessment and recommendations.
                </p>
              </div>

              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upload">Upload Image</TabsTrigger>
                  <TabsTrigger value="report" disabled={!report}>
                    View Report
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="upload" className="space-y-6">
                  <ImageUploader onImageUploaded={handleImageUploaded} />
                  <Button
                    className="w-full bg-street-orange hover:bg-street-orange/90 text-white"
                    onClick={handleAnalyzeImage}
                    disabled={!uploadedImage || isAnalyzing}
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      "Analyze Hygiene"
                    )}
                  </Button>
                </TabsContent>
                <TabsContent value="report">
                  {report && (
                    <HygieneReportCard
                      report={report}
                      originalImage={uploadedImage}
                      hygieneIssues={report.hygieneIssues} // Pass hygiene issues data
                    />
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-muted py-12">
          <div className="container px-4 md:px-6">
            <div className="text-center space-y-4 mb-8">
              <h2 className="text-3xl font-bold">How It Works</h2>
              <p className="text-muted-foreground max-w-[700px] mx-auto">
                Our system uses advanced AI to analyze vendor hygiene and
                provide actionable recommendations for improvement.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="bg-street-yellow/20 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <span className="text-street-orange text-xl font-bold">
                    1
                  </span>
                </div>
                <h3 className="font-bold text-lg mb-2">Upload</h3>
                <p className="text-muted-foreground">
                  Take a photo of the street food vendor or upload an existing
                  image.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="bg-street-yellow/20 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <span className="text-street-orange text-xl font-bold">
                    2
                  </span>
                </div>
                <h3 className="font-bold text-lg mb-2">Analyze</h3>
                <p className="text-muted-foreground">
                  Our AI system analyzes the image for hygiene practices and
                  standards.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="bg-street-yellow/20 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <span className="text-street-orange text-xl font-bold">
                    3
                  </span>
                </div>
                <h3 className="font-bold text-lg mb-2">Improve</h3>
                <p className="text-muted-foreground">
                  Receive detailed reports and recommendations to improve food
                  safety.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
