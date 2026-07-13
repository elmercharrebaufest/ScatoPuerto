BEGIN TRY
    BEGIN TRAN;

    IF OBJECT_ID('dbo.CamarasAduana', 'U') IS NOT NULL
        DROP TABLE dbo.CamarasAduana;

    CREATE TABLE dbo.CamarasAduana
    (
        Id INT IDENTITY(1,1) NOT NULL,
        Nombre NVARCHAR(255) NOT NULL,
        Url NVARCHAR(500) NOT NULL,
        Posicion INT NOT NULL,

        CONSTRAINT PK_CamarasAduana PRIMARY KEY CLUSTERED (Id)
    );

    SET IDENTITY_INSERT dbo.CamarasAduana ON;

    INSERT INTO dbo.CamarasAduana (Id, Nombre, Url, Posicion)
    VALUES
        (1, '001 domo Pila 1 - Lado RIO', 'http://10.10.115.81/axis-cgi/mjpg/video.cgi', 1),
        (2, '002 domo pila3 - Lado rio', 'http://10.10.115.82/axis-cgi/mjpg/video.cgi', 2),
        (3, '006 Puerta 18-Puerto', 'http://10.10.115.87/axis-cgi/mjpg/video.cgi', 3),
        (4, '007 Pasarela muelle', 'http://10.10.115.88/axis-cgi/mjpg/video.cgi', 4),
        (5, '154 cinta 209/210-C2', 'http://10.10.115.239/axis-cgi/mjpg/video.cgi?camera=2', 5),
        (6, '155 cinta 211/212/255 - C1', 'http://10.10.115.239/axis-cgi/mjpg/video.cgi', 6),
        (7, '159 Proa Buque C4', 'http://10.10.115.238/axis-cgi/mjpg/video.cgi?camera=4', 7),
        (8, '160 Cinta 213/214 - C1', 'http://10.10.115.238/axis-cgi/mjpg/video.cgi', 8);

    SET IDENTITY_INSERT dbo.CamarasAduana OFF;

    COMMIT;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK;

    THROW;
END CATCH;