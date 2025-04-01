-- DropForeignKey
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_roomSlug_fkey";

-- AlterTable
ALTER TABLE "Chat" ALTER COLUMN "roomSlug" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_roomSlug_fkey" FOREIGN KEY ("roomSlug") REFERENCES "Room"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;
