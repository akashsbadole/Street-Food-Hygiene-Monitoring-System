/*
  Warnings:

  - Added the required column `updatedAt` to the `AnalysisData` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AnalysisData" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "imageUrl" TEXT NOT NULL,
    "analysisResult" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_AnalysisData" ("analysisResult", "id", "imageUrl", "timestamp") SELECT "analysisResult", "id", "imageUrl", "timestamp" FROM "AnalysisData";
DROP TABLE "AnalysisData";
ALTER TABLE "new_AnalysisData" RENAME TO "AnalysisData";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
