BEGIN TRY;
    BEGIN TRAN;

    Update ATAPuerto set Activa = 0 where Id in (4,8,26,54,58);

    COMMIT;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK;

    BEGIN TRY
        SET IDENTITY_INSERT ATAPuerto OFF;
    END TRY
    BEGIN CATCH
    END CATCH;

    THROW;
END CATCH;