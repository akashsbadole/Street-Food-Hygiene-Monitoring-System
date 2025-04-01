/*
  Warnings:

  - Added the required column `path` to the `AnalysisData` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AnalysisData" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "imageUrl" TEXT NOT NULL,
    "analysisResult" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "path" TEXT NOT NULL
);
INSERT INTO "new_AnalysisData" ("analysisResult", "createdAt", "id", "imageUrl", "timestamp", "updatedAt") SELECT "analysisResult", "createdAt", "id", "imageUrl", "timestamp", "updatedAt" FROM "AnalysisData";
DROP TABLE "AnalysisData";
ALTER TABLE "new_AnalysisData" RENAME TO "AnalysisData";
CREATE UNIQUE INDEX "AnalysisData_path_key" ON "AnalysisData"("path");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
