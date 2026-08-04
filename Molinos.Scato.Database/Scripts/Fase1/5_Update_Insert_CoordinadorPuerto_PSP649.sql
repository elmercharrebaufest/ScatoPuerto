BEGIN TRY;
    BEGIN TRAN;

    -- Habilitado = 0
    UPDATE coordinadorPuerto 
    SET Habilitado = 0 
    WHERE Id IN (
        45, 47, 48, 49, 50, 52, 54, 55, 57, 58, 59, 60, 61, 62, 63, 64, 
        65, 67, 68, 69, 71, 72, 74, 75, 76, 77, 78, 79, 81, 83, 84, 85, 
        86, 87, 88, 89, 90, 91, 92, 93, 94, 95
    );

    Update coordinadorPuerto set CodigoSap = 'PCO0001' where Id = 1;
    Update coordinadorPuerto set CodigoSap = 'PCO0002' where Id = 2;
    Update coordinadorPuerto set CodigoSap = 'PCO0003' where Id = 3;
    Update coordinadorPuerto set CodigoSap = 'PCO0005' where Id = 4;
    Update coordinadorPuerto set CodigoSap = 'PCO00058' where Id = 5;
    Update coordinadorPuerto set CodigoSap = 'PCO0007' where Id = 6;
    Update coordinadorPuerto set CodigoSap = 'PCO0008' where Id = 7;
    Update coordinadorPuerto set CodigoSap = 'PCO0009' where Id = 8;
    Update coordinadorPuerto set CodigoSap = 'PCO0010' where Id = 9;
    Update coordinadorPuerto set CodigoSap = 'PCO0011' where Id = 10;
    Update coordinadorPuerto set CodigoSap = 'PCO0012' where Id = 11;
    Update coordinadorPuerto set CodigoSap = 'PCO0013' where Id = 12;
    Update coordinadorPuerto set CodigoSap = 'PCO0014' where Id = 13;
    Update coordinadorPuerto set CodigoSap = 'PCO0015' where Id = 14;
    Update coordinadorPuerto set CodigoSap = 'PCO0016' where Id = 15;
    Update coordinadorPuerto set CodigoSap = 'PCO0017' where Id = 16;
    Update coordinadorPuerto set CodigoSap = 'PCO0018' where Id = 17;
    Update coordinadorPuerto set CodigoSap = 'PCO0019' where Id = 18;
    Update coordinadorPuerto set CodigoSap = 'PCO0020' where Id = 19;
    Update coordinadorPuerto set CodigoSap = 'PCO0025' where Id = 20;
    Update coordinadorPuerto set CodigoSap = 'PCO0026' where Id = 21;
    Update coordinadorPuerto set CodigoSap = 'PCO0027' where Id = 22;
    Update coordinadorPuerto set CodigoSap = 'PCO0028' where Id = 23;
    Update coordinadorPuerto set CodigoSap = 'PCO0029' where Id = 24;
    Update coordinadorPuerto set CodigoSap = 'PCO0030' where Id = 25;
    Update coordinadorPuerto set CodigoSap = 'PCO0031' where Id = 26;
    Update coordinadorPuerto set CodigoSap = 'PCO0032' where Id = 27;
    Update coordinadorPuerto set CodigoSap = 'PCO0033' where Id = 28;
    Update coordinadorPuerto set CodigoSap = 'PCO0034' where Id = 29;
    Update coordinadorPuerto set CodigoSap = 'PCO0035' where Id = 30;
    Update coordinadorPuerto set CodigoSap = 'PCO0036' where Id = 31;
    Update coordinadorPuerto set CodigoSap = 'PCO0037' where Id = 32;
    Update coordinadorPuerto set CodigoSap = 'PCO0038' where Id = 33;
    Update coordinadorPuerto set CodigoSap = 'PCO0041' where Id = 34;
    Update coordinadorPuerto set CodigoSap = 'PCO0042' where Id = 35;
    Update coordinadorPuerto set CodigoSap = 'PCO0048' where Id = 36;
    Update coordinadorPuerto set CodigoSap = 'PCO0050' where Id = 37;
    Update coordinadorPuerto set CodigoSap = 'PCO0052' where Id = 38;
    Update coordinadorPuerto set CodigoSap = 'PCO0053' where Id = 39;
    Update coordinadorPuerto set CodigoSap = 'PCO0054' where Id = 40;
    Update coordinadorPuerto set CodigoSap = 'PCO0056' where Id = 41;
    Update coordinadorPuerto set CodigoSap = 'PCO055' where Id = 42;
    Update coordinadorPuerto set CodigoSap = 'PCO056' where Id = 43;
    Update coordinadorPuerto set CodigoSap = 'PCO057' where Id = 44;
    Update coordinadorPuerto set CodigoSap = 'PCO0055' where Id = 53;
    Update coordinadorPuerto set CodigoSap = 'PCO0059' where Id = 56;


    SET IDENTITY_INSERT CoordinadorPuerto ON;

    DECLARE @Id int = (SELECT MAX(Id) + 1 FROM CoordinadorPuerto);

    Insert into CoordinadorPuerto (Id,CodigoSap, nombre, habilitado) values (@Id,'PCO0058','CAM2', 1);
    SET @Id = @Id +1;
    Insert into CoordinadorPuerto (Id,CodigoSap, nombre, habilitado) values (@Id,'PCO0006','Enerfo2', 1);

    SET IDENTITY_INSERT CoordinadorPuerto OFF;

    COMMIT;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK;

    BEGIN TRY
        SET IDENTITY_INSERT CoordinadorPuerto OFF;
    END TRY
    BEGIN CATCH
    END CATCH;

    THROW;
END CATCH;