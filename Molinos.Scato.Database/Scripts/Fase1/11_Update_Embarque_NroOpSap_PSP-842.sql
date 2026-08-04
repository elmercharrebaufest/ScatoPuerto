BEGIN TRY
    BEGIN TRAN;

    SELECT 
        e.Id                        AS Embarque_Id,
        e.NroOpSap                  AS NroOpSap_Actual,
        e.Id + 10000                AS NroOpSap_Nuevo,
        e.SanBenito,
        e.Ubicacion,
        lu.Id                       AS LineUp_Id,
        lu.Ocultar,
        lu.ModuloDeCarga_Id
    FROM [dbo].[Embarque] e
    INNER JOIN [dbo].[LineUp] lu ON lu.Embarque_Id = e.Id
    WHERE lu.Ocultar = 0
      AND lu.ModuloDeCarga_Id IS NOT NULL
      AND lu.ModuloDeCarga_Id > 0
      AND e.SanBenito = 1
      AND e.Ubicacion != 1
      AND e.NroOpSap IS NULL;

    --Actualizacion
    UPDATE e
    SET e.NroOpSap = e.Id + 10000
    FROM [dbo].[Embarque] e
    INNER JOIN [dbo].[LineUp] lu ON lu.Embarque_Id = e.Id
    WHERE lu.Ocultar = 0
      AND lu.ModuloDeCarga_Id IS NOT NULL
      AND lu.ModuloDeCarga_Id > 0
      AND e.SanBenito = 1
      AND e.Ubicacion != 1
      AND e.NroOpSap IS NULL;

    PRINT CONCAT('Registros actualizados: ', @@ROWCOUNT);

    COMMIT;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK;
    PRINT 'Error durante la actualización:';
    PRINT ERROR_MESSAGE();
    THROW;
END CATCH;