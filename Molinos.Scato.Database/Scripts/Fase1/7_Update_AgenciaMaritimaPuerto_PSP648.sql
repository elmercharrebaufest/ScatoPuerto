BEGIN TRY;
    BEGIN TRAN;

    Update AgenciaMaritimaPuerto set Activa = 0 where CodigoSap is null;

    COMMIT;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK;

    BEGIN TRY
        SET IDENTITY_INSERT AgenciaMaritimaPuerto OFF;
    END TRY
    BEGIN CATCH
    END CATCH;

    THROW;
END CATCH;