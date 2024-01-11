-- AlterTable
ALTER TABLE "blocked_users" ADD COLUMN     "issue_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "avatar" SET DEFAULT 'https://i.imgur.com/YrZrRz0.jpg';
