BEGIN TRY;
    BEGIN TRAN;

    UPDATE MaterialPuerto SET CodigoSap = '94705' WHERE id = 6;
    UPDATE MaterialPuerto SET CodigoSap = '50112' WHERE id = 7;
    UPDATE MaterialPuerto SET CodigoSap = '99131' WHERE id = 12;
    UPDATE MaterialPuerto SET CodigoSap = '99710' WHERE id = 249622;
    UPDATE MaterialPuerto SET CodigoSap = '99709' WHERE id = 249623;
    UPDATE MaterialPuerto SET CodigoSap = '94706' WHERE id = 249624;
    UPDATE MaterialPuerto SET CodigoSap = '94707' WHERE id = 249625;

    -- Activo = 0
    UPDATE MaterialPuerto 
    SET Activo = 0 
    WHERE id IN (15, 21, 88974);

    COMMIT;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK;

    THROW;
END CATCH;