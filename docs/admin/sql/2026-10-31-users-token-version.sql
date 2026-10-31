-- Repair schema drift in the existing local EnglishCenterDB.
-- User.TokenVersion and the checked-in InitialCreate migration already define this column.
-- Do not edit the applied migration or run unrelated migrations/seeds for this repair.
SET XACT_ABORT ON;
SET NOCOUNT ON;
IF DB_NAME() <> N'EnglishCenterDB'
    THROW 50001, N'Wrong database. Connect to EnglishCenterDB before running this script.', 1;
IF OBJECT_ID(N'dbo.Users', N'U') IS NULL
    THROW 50002, N'dbo.Users does not exist.', 1;

BEGIN TRANSACTION;
IF COL_LENGTH(N'dbo.Users', N'TokenVersion') IS NULL
BEGIN
    ALTER TABLE dbo.Users ADD TokenVersion int NOT NULL
        CONSTRAINT DF_Users_TokenVersion DEFAULT (0) WITH VALUES;
END
ELSE
BEGIN
    IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.Users')
        AND name = N'TokenVersion' AND (system_type_id <> TYPE_ID(N'int') OR is_nullable = 1))
        THROW 50003, N'Existing TokenVersion is incompatible; no automatic conversion performed.', 1;
    IF NOT EXISTS (SELECT 1 FROM sys.default_constraints d
        JOIN sys.columns c ON c.object_id = d.parent_object_id AND c.column_id = d.parent_column_id
        WHERE d.parent_object_id = OBJECT_ID(N'dbo.Users') AND c.name = N'TokenVersion')
        ALTER TABLE dbo.Users ADD CONSTRAINT DF_Users_TokenVersion DEFAULT (0) FOR TokenVersion;
END;
COMMIT TRANSACTION;
