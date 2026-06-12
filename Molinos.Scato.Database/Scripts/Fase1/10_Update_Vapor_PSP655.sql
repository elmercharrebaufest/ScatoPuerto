BEGIN TRY;
    BEGIN TRAN;

    UPDATE [dbo].[VaporInformacion]
    SET [EnSap] = 1
    WHERE [ImoVapor] IS NOT NULL;

    UPDATE [dbo].[Vapor]
    SET [Habilitado] = 0
    WHERE EXISTS (
        SELECT 1
        FROM [dbo].[VaporInformacion] [VI]
        WHERE [VI].[VaporId] = [Vapor].[Id]
          AND [VI].[ImoVapor] IS NULL
    )
    OR NOT EXISTS (
        SELECT 1
        FROM [dbo].[VaporInformacion] [VI]
        WHERE [VI].[VaporId] = [Vapor].[Id]
    );

    COMMIT;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK;

    THROW;
END CATCH;