import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  ShieldAlert,
  ShieldQuestion,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  AlertOctagon,
  ImageIcon,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import jsPDF from "jspdf";

export interface HygieneReport {
  hygieneIssues: HygieneIssue[];
  score: number;
  cleanliness: string;
  foodHandling: string;
  personalHygiene: string;
  workstation: string;
  utensils: string;
  overallVerdict: string;
  recommendations: string[];
  detectedIssues?: string[];
  markedImageData?: string;
}

export interface HygieneIssue {
  x: number;
  y: number;
  radius: number;
}

interface HygieneReportCardProps {
  report: HygieneReport;
  originalImage?: string;
  hygieneIssues: HygieneIssue[];
  isLoading?: boolean;
}

const getScoreColor = (score: number) => {
  if (score >= 80) return "text-street-green";
  if (score >= 60) return "text-street-orange";
  return "text-street-red";
};

const getScoreBadge = (score: number) => {
  if (score >= 80) {
    return (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
        <ShieldCheck className="h-3.5 w-3.5 mr-1" />
        Safe
      </Badge>
    );
  }
  if (score >= 60) {
    return (
      <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
        <ShieldAlert className="h-3.5 w-3.5 mr-1" />
        Needs Improvement
      </Badge>
    );
  }
  return (
    <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
      <ShieldQuestion className="h-3.5 w-3.5 mr-1" />
      Unsafe
    </Badge>
  );
};

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case "good":
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case "poor":
      return <XCircle className="h-5 w-5 text-red-500" />;
    case "fair":
      return <AlertCircle className="h-5 w-5 text-orange-500" />;
    default:
      return <ShieldQuestion className="h-5 w-5 text-blue-500" />;
  }
};

const hygieneStandards = {
  cleanliness: {
    title: "Proper Cleanliness Standards",
    methods: [
      "Clean all surfaces with food-safe sanitizer before and after food preparation",
      "Use separate cleaning tools for food and non-food surfaces",
      "Maintain a regular cleaning schedule for all equipment and surfaces",
      "Dispose of waste in covered bins and empty them regularly",
      "Keep preparation area free from pests with proper prevention measures",
    ],
  },
  foodHandling: {
    title: "Proper Food Handling Techniques",
    methods: [
      "Store raw and cooked foods separately to prevent cross-contamination",
      "Use proper time and temperature controls for food storage",
      "Cook foods to appropriate internal temperatures",
      "Avoid bare hand contact with ready-to-eat foods",
      "Practice first-in, first-out (FIFO) inventory management",
    ],
  },
  personalHygiene: {
    title: "Proper Personal Hygiene Practices",
    methods: [
      "Wash hands thoroughly with soap and water for at least 20 seconds before handling food",
      "Wear clean clothes and hair restraints when preparing food",
      "Use disposable gloves when handling ready-to-eat foods",
      "Avoid food handling when sick or with open wounds",
      "Cover mouth and nose when coughing or sneezing, then wash hands",
    ],
  },
  workstation: {
    title: "Proper Workstation Management",
    methods: [
      "Organize workstation to prevent cross-contamination between raw and cooked foods",
      "Maintain separate areas for preparation and serving",
      "Keep all containers labeled and dated",
      "Store cleaning supplies away from food preparation areas",
      "Ensure proper lighting and ventilation in the preparation area",
    ],
  },
  utensils: {
    title: "Proper Utensil Care",
    methods: [
      "Clean and sanitize utensils before and after each use",
      "Store utensils in clean, covered containers",
      "Replace or repair damaged utensils that cannot be properly cleaned",
      "Use separate utensils for raw and cooked foods",
      "Sanitize utensils with appropriate food-safe sanitizers",
    ],
  },
};

const HygieneReportCard = ({
  report,
  originalImage,
  hygieneIssues,
  isLoading = false,
}: HygieneReportCardProps) => {
  const [openCategories, setOpenCategories] = React.useState<
    Record<string, boolean>
  >({});

  const toggleCategory = (category: string) => {
    setOpenCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const handleDownloadReport = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Hygiene Assessment Report", 10, 10);
    doc.setFontSize(12);
    doc.text(`Overall Score: ${report.score}/100`, 10, 20);
    doc.text(`Overall Verdict: ${report.overallVerdict}`, 10, 30);

    doc.text("Detected Issues:", 10, 40);
    report.detectedIssues?.forEach((issue, index) => {
      doc.text(`${index + 1}. ${issue}`, 10, 50 + index * 10);
    });

    doc.text(
      "Recommendations:",
      10,
      60 + (report.detectedIssues?.length || 0) * 10
    );
    report.recommendations.forEach((rec, index) => {
      doc.text(
        `${index + 1}. ${rec}`,
        10,
        70 + (report.detectedIssues?.length || 0) * 10 + index * 10
      );
    });

    doc.save("Hygiene_Report.pdf");
  };

  if (isLoading) {
    return (
      <Card className="w-full animate-pulse">
        <CardHeader>
          <div className="h-7 bg-gray-200 rounded w-3/4"></div>
          <div className="h-5 bg-gray-200 rounded w-1/2 mt-2"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Hygiene Assessment Report</CardTitle>
          {getScoreBadge(report.score)}
        </div>
        <CardDescription>
          TensorFlow.js-powered analysis with proper hygiene methods
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Image Analysis Results Section */}
        {originalImage && (
          <Tabs defaultValue="marked" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="marked">
                <ImageIcon className="h-4 w-4 mr-2" />
                Issues Detected
              </TabsTrigger>
              <TabsTrigger value="original">
                <ImageIcon className="h-4 w-4 mr-2" />
                Original Image
              </TabsTrigger>
            </TabsList>
            <TabsContent value="marked" className="mt-2">
              <div className="relative border border-dotted border-gray-400 rounded-lg overflow-hidden">
                <img
                  src={originalImage}
                  alt="Uploaded"
                  className="w-full object-contain max-h-96"
                />
                {hygieneIssues.map((issue, index) => (
                  <div
                    key={index}
                    className="absolute border-2 border-dotted border-red-500 rounded-full"
                    style={{
                      left: `${issue.x}%`,
                      top: `${issue.y}%`,
                      width: `${issue.radius * 2}px`,
                      height: `${issue.radius * 2}px`,
                      transform: "translate(-50%, -50%)",
                    }}
                  />
                ))}
              </div>
              <p className="text-xs text-center text-muted-foreground mt-2">
                Image with detected hygiene issues highlighted
              </p>
            </TabsContent>
            <TabsContent value="original" className="mt-2">
              <div className="border border-dotted border-gray-400 rounded-lg overflow-hidden">
                <img
                  src={originalImage}
                  alt="Original Image"
                  className="w-full object-contain max-h-96"
                />
              </div>
              <p className="text-xs text-center text-muted-foreground mt-2">
                Original uploaded image
              </p>
            </TabsContent>
          </Tabs>
        )}

        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Overall Hygiene Score</span>
            <span
              className={`text-lg font-bold ${getScoreColor(report.score)}`}
            >
              {report.score}/100
            </span>
          </div>
          <Progress
            value={report.score}
            className={`h-2 ${
              report.score >= 80
                ? "bg-green-100 [&>div]:bg-street-green"
                : report.score >= 60
                ? "bg-orange-100 [&>div]:bg-street-orange"
                : "bg-red-100 [&>div]:bg-street-red"
            }`}
          />
        </div>

        {/* AI-Detected Issues Section */}
        {report.detectedIssues && report.detectedIssues.length > 0 && (
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="flex items-center gap-2 mb-2">
              <AlertOctagon className="h-5 w-5 text-red-500" />
              <h3 className="font-semibold text-red-700">
                Detected Hygiene Issues
              </h3>
            </div>
            <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
              {report.detectedIssues.map((issue, index) => (
                <li key={index}>{issue}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4">
          {Object.entries(hygieneStandards).map(([category, standards]) => {
            const reportCategory = category as keyof HygieneReport;
            const status = report[reportCategory] as string;
            const isOpen = openCategories[category] || false;

            return (
              <Collapsible
                key={category}
                open={isOpen}
                onOpenChange={() => toggleCategory(category)}
                className="border rounded-md overflow-hidden"
              >
                <div className="flex items-center justify-between p-3 bg-muted/20">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(status)}
                    <span className="font-medium capitalize">{category}</span>
                    <Badge
                      variant={
                        status.toLowerCase() === "good" ? "outline" : "default"
                      }
                      className="ml-2"
                    >
                      {status}
                    </Badge>
                  </div>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Info className="h-4 w-4 mr-1" />
                      {isOpen ? "Hide" : "Show"} Proper Methods
                    </Button>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent>
                  <div className="p-3 bg-muted/10 border-t">
                    <h4 className="font-medium text-sm mb-2">
                      {standards.title}
                    </h4>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                      {standards.methods.map((method, idx) => (
                        <li key={idx}>{method}</li>
                      ))}
                    </ul>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>

        <div>
          <h3 className="font-semibold mb-2">Overall Assessment</h3>
          <p className="text-sm text-muted-foreground">
            {report.overallVerdict}
          </p>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Improvement Recommendations</h3>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
            {report.recommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <Button
          variant="outline"
          size="sm"
          className="text-street-orange"
          onClick={handleDownloadReport}
        >
          Download Report
        </Button>
        <div className="flex gap-2">
          <Badge variant="outline" className="cursor-default">
            TensorFlow.js
          </Badge>
          <Badge variant="outline" className="cursor-default">
            {new Date().toLocaleDateString()}
          </Badge>
        </div>
      </CardFooter>
    </Card>
  );
};

export default HygieneReportCard;
