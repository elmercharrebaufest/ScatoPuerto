BEGIN TRY;
    BEGIN TRAN;

    Update MaterialPuerto set CodigoSap = '94705' where Id = 6;
    Update MaterialPuerto set CodigoSap = '50112' where Id = 7;
    Update MaterialPuerto set CodigoSap = '99131' where Id = 12;
    Update MaterialPuerto set Activo = 0 where Id = 15;
    Update MaterialPuerto set Activo = 0 where Id = 21;
    Update MaterialPuerto set Activo = 0 where Id = 88974;
    Update MaterialPuerto set CodigoSap = '99710' where Id = 249622;
    Update MaterialPuerto set CodigoSap = '99709' where Id = 249623;
    Update MaterialPuerto set CodigoSap = '94706' where Id = 249624;
    Update MaterialPuerto set CodigoSap = '94707' where Id = 249625;

    COMMIT;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK;

    THROW;
END CATCH;
