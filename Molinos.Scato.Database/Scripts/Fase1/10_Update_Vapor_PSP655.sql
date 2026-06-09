BEGIN TRY;
    BEGIN TRAN;

    UPDATE [dbo].[VaporInformacion]
    SET [EnSap] = 1
    WHERE [ImoVapor] IS NOT NULL;
    
    COMMIT;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK;

    THROW;
END CATCH;
