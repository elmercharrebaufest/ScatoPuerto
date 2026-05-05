BEGIN TRY;
    BEGIN TRAN;

    -- Habilitado = 0
    UPDATE exportador 
    SET Habilitado = 0 
    WHERE Id IN (1, 7, 8, 15, 16, 20, 26, 30, 31, 32, 39, 40, 42, 43, 45, 51, 56, 65, 67, 78, 82, 84, 94, 265, 133936);

    UPDATE exportador set CodigoSap = '1167520000', Habilitado = 0 where Id = 3;

    UPDATE exportador SET CodigoSap = '4932020000', Cuit = '30715118773' WHERE Id IN (77, 132330, 133940, 133941, 133943, 133945);
    UPDATE exportador SET CodigoSap = '4901770000', Cuit = '30500959629' WHERE Id IN (12, 133946);
    UPDATE exportador SET CodigoSap = '4901750000', Cuit = '30500120882' WHERE Id IN (13, 93);
    UPDATE exportador SET CodigoSap = '4902360000', Cuit = '30525718626' WHERE Id IN (21, 41, 267);
    UPDATE exportador SET CodigoSap = '4904410000', Cuit = '30678544007' WHERE Id IN (34, 46);
    UPDATE exportador SET CodigoSap = '4901820000', Cuit = '30501912405' WHERE Id IN (35, 85);
    UPDATE exportador SET CodigoSap = '4902380000', Cuit = '30526712729' WHERE Id IN (36, 91, 92);
    UPDATE exportador SET CodigoSap = '4906450000', Cuit = '33502232229' WHERE Id IN (133937, 133939);


    Update exportador set CodigoSap = '4904830000', Cuit = '30700869918' where Id = 6;
    Update exportador set CodigoSap = '1167830000', Cuit = '30552587827' where Id = 10;
    Update exportador set CodigoSap = '4905770000', Cuit = '30709590894' where Id = 14;
    Update exportador set CodigoSap = '4902640000', Cuit = '30546689979' where Id = 22;
    Update exportador set CodigoSap = '4919970000', Cuit = '30709967947' where Id = 54;
    Update exportador set CodigoSap = '4931750000', Cuit = '33709699879' where Id = 55;
    Update exportador set CodigoSap = '4922990000', Cuit = '30710235275' where Id = 57;
    Update exportador set CodigoSap = '4913240000', Cuit = '30517486678' where Id = 58;
    Update exportador set CodigoSap = '4963860000', Cuit = '33711681359' where Id = 59;
    Update exportador set CodigoSap = '4964120000', Cuit = '30623848309' where Id = 61;
    Update exportador set CodigoSap = '4903490000', Cuit = '30629416249' where Id = 62;
    Update exportador set CodigoSap = '4906570000', Cuit = '33554380749' where Id = 64;
    Update exportador set CodigoSap = '4921010000', Cuit = '30711615519' where Id = 66;
    Update exportador set CodigoSap = '4903240000', Cuit = '30613985995' where Id = 68;
    Update exportador set CodigoSap = '4927300000', Cuit = '30707003118' where Id = 69;
    Update exportador set CodigoSap = '4928970000', Cuit = '30500658912' where Id = 71;
    Update exportador set CodigoSap = '4916410000', Cuit = '30671729338' where Id = 72;
    Update exportador set CodigoSap = '4929670000', Cuit = '30697312028' where Id = 73;
    Update exportador set CodigoSap = '4929560000', Cuit = '30712324534' where Id = 76;
    Update exportador set CodigoSap = '4901900000', Cuit = '30506792165' where Id = 79;
    Update exportador set CodigoSap = '4931200000', Cuit = '30506176278' where Id = 83;
    Update exportador set CodigoSap = '4912990000', Cuit = '30509529937' where Id = 86;
    Update exportador set CodigoSap = '4942290000', Cuit = '30714792942' where Id = 87;
    Update exportador set CodigoSap = '4915820000', Cuit = '30646328450' where Id = 90;
    Update exportador set CodigoSap = '4906470000', Cuit = '33506737449' where Id = 96;
    Update exportador set CodigoSap = '4926470000', Cuit = '30683109033' where Id = 133930;
    Update exportador set CodigoSap = '4923040000', Cuit = '30711160163' where Id = 133931;
    Update exportador set CodigoSap = '4932210000', Cuit = '30500858628' where Id = 133932;
    Update exportador set CodigoSap = '4980750000', Cuit = '30717432122' where Id = 133933;
    Update exportador set CodigoSap = '4980230000', Cuit = '30578036071' where Id = 133934;
    Update exportador set CodigoSap = '4901830000', Cuit = '30502874353' where Id = 133935;

    COMMIT;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK;

    THROW;
END CATCH;
