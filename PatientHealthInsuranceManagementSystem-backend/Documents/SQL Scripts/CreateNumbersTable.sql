CREATE TABLE numbers (number INT CHECK (number > 0) PRIMARY KEY);
GO

CREATE PROCEDURE populateNumbers
AS
BEGIN
SET NOCOUNT ON;
	DECLARE @x int;
    SET @x = 0;
    WHILE @x < 1024 BEGIN
        INSERT INTO Numbers VALUES (@x);
        SET @x = @x + 1;
    END;
    SET @x = NULL;
END; 
GO

EXEC populateNumbers;
DROP PROCEDURE populateNumbers;