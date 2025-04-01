-- CreateTable
CREATE TABLE "AnalysisData" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "imageUrl" TEXT NOT NULL,
    "analysisResult" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL
);
