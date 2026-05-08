-- Add tokenVersion column to users table
-- This migration adds token versioning for enhanced security

DO $$ 
BEGIN
    -- Check if column doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'tokenVersion'
    ) THEN
        -- Add the column with default value 0
        ALTER TABLE users ADD COLUMN "tokenVersion" integer DEFAULT 0;
        
        -- Update existing records to have tokenVersion = 0
        UPDATE users SET "tokenVersion" = 0 WHERE "tokenVersion" IS NULL;
        
        RAISE NOTICE '✅ tokenVersion column added successfully';
    ELSE
        RAISE NOTICE 'ℹ️ tokenVersion column already exists';
    END IF;
END $$;
