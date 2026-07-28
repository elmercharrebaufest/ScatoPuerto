BEGIN TRY
    BEGIN TRAN;

    IF COL_LENGTH('dbo.Embarque', 'TransaccionesSAP_Id') IS NULL
    BEGIN
        ALTER TABLE [dbo].[Embarque]
        ADD [TransaccionesSAP_Id] BIGINT NULL;
    END

    IF COL_LENGTH('dbo.VaporInformacion', 'EnSap') IS NULL
    BEGIN
        ALTER TABLE [dbo].[VaporInformacion]
        ADD [EnSap] BIT NULL;
    END

    IF NOT EXISTS (
        SELECT 1
        FROM sys.foreign_keys
        WHERE [name] = 'FK_dbo.Embarque_dbo.TransaccionesSAP'
          AND parent_object_id = OBJECT_ID(N'[dbo].[Embarque]')
    )
    BEGIN
        ALTER TABLE [dbo].[Embarque]
        ADD CONSTRAINT [FK_dbo.Embarque_dbo.TransaccionesSAP]
        FOREIGN KEY ([TransaccionesSAP_Id])
        REFERENCES [dbo].[TransaccionesSAP] ([Id]);
    END

    COMMIT;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK;

    THROW;
END CATCH;