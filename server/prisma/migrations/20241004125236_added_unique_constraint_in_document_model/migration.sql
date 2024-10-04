/*
  Warnings:

  - A unique constraint covering the columns `[documentId]` on the table `Document` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Document_documentId_key" ON "Document"("documentId");
