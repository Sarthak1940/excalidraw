-- DropForeignKey
ALTER TABLE "Room" DROP CONSTRAINT "Room_adminId_fkey";

-- DropForeignKey
ALTER TABLE "Shape" DROP CONSTRAINT "Shape_roomId_fkey";

-- DropForeignKey
ALTER TABLE "Shape" DROP CONSTRAINT "Shape_userId_fkey";

-- CreateIndex
CREATE INDEX "Room_adminId_idx" ON "Room"("adminId");

-- CreateIndex
CREATE INDEX "Shape_roomId_idx" ON "Shape"("roomId");

-- CreateIndex
CREATE INDEX "Shape_userId_idx" ON "Shape"("userId");

-- CreateIndex
CREATE INDEX "Shape_createdAt_idx" ON "Shape"("createdAt");

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shape" ADD CONSTRAINT "Shape_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shape" ADD CONSTRAINT "Shape_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
