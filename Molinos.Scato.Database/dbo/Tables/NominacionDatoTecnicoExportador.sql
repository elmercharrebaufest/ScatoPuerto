create table NominacionDatoTecnicoExportador(
Id int IDENTITY (1, 1) NOT NULL,
Exportador_Id int not null,
Cantidad DECIMAL(20, 3) not null,
Tolerancia int NULL,
NominacionDatoTecnico_Id  int not null,
[ToleranciasDiferenciadas] BIT NULL, 
[ToleranciaPositiva] INT NULL, 
[ToleranciaNegativa] INT NULL, 
[CantidadExacta] DECIMAL(20, 3) NULL, 
[CantidadConTolerancia] DECIMAL(20, 3) NULL, 
CONSTRAINT [PK_dbo.NominacionDatoTecnicoExportador] PRIMARY KEY CLUSTERED ([Id] ASC),
CONSTRAINT [FK_dbo.NominacionDatoTecnicoExportador_dbo.Exportador_Exportador_Id] FOREIGN KEY ([Exportador_Id]) REFERENCES [dbo].[Exportador] ([Id]),
CONSTRAINT [FK_dbo.NominacionDatoTecnicoExportador_dbo.NominacionDatoTecnico_NominacionDatoTecnico_Id] FOREIGN KEY ([NominacionDatoTecnico_Id]) REFERENCES [dbo].[NominacionDatoTecnico] ([Id]),
)

GO

CREATE TRIGGER [dbo].[Trigger_NominacionDatoTecnicoExportador]
    ON [dbo].[NominacionDatoTecnicoExportador]
    FOR INSERT, UPDATE, DELETE
    AS
    BEGIN
       
        DECLARE @idNominacion INT,
                @dateDiff INT,
                @idEmbarque INT,
                @muelle NVARCHAR(60),
                @nombreEmbarque NVARCHAR(60),
                @exportadorPrevio NVARCHAR(60),
                @exportadorNuevo NVARCHAR(60);

        SELECT  @idNominacion = n.Id, @idEmbarque = n.Embarque_Id, 
                @dateDiff = DATEDIFF(SECOND, n.FechaCreacion, GETDATE()) -- Segundos entre la creaci�n de la nominaci�n y el insert de Exportador
        FROM NominacionDatoTecnicoExportador dte
        INNER JOIN NominacionDatoTecnico dt ON dte.NominacionDatoTecnico_Id = dt.Id
        INNER JOIN Nominacion n ON dt.Id = n.NominacionDatoTecnico_Id
        WHERE dt.Id = (
            SELECT DISTINCT NominacionDatoTecnico_Id FROM (
                SELECT NominacionDatoTecnico_Id FROM deleted UNION
                SELECT NominacionDatoTecnico_Id FROM inserted
            ) a
            WHERE NominacionDatoTecnico_Id IS NOT NULL
        )

        SELECT @exportadorPrevio = E.Nombre from deleted D INNER JOIN Exportador E ON D.Exportador_Id = E.Id
        SELECT @exportadorNuevo = E.Nombre from inserted I INNER JOIN Exportador E ON I.Exportador_Id = E.Id

        IF (@idEmbarque > 0) BEGIN
            SELECT @nombreEmbarque = Patente,
            @muelle = CASE 
                WHEN Vicentin = 'true' THEN 'Vicentin'
                WHEN Noryon = 'true' THEN 'Noryon'
                WHEN SanBenito = 'true' THEN 'San Benito'
                ELSE 'Otros muelles' END
            FROM Embarque WHERE Id = @idEmbarque
        END
        -- UPDATE
        IF EXISTS (SELECT 1 FROM deleted) AND EXISTS (SELECT 1 FROM inserted) BEGIN 
            -- Exportador
            IF ((SELECT Exportador_Id FROM deleted) <> (SELECT Exportador_Id FROM inserted)) BEGIN
                INSERT INTO Auditoria
                SELECT @idNominacion , d.id, 'NominacionDatoTecnicoExportador', 'Exportador_Id', d.Exportador_Id, i.Exportador_Id , GETDATE(), NULL, NULL
                FROM deleted AS d JOIN inserted AS i ON d.Id = i.Id

                IF (@idEmbarque > 0) BEGIN
                    INSERT INTO NotificacionProgramaDeEmbarque (TipoAlerta, Mensaje, Fecha)
                    SELECT 9, CONCAT('Se ha editado el embarque ', @nombreEmbarque, ' - ', @muelle, ': Exportador (', @exportadorPrevio, ' -> ', @exportadorNuevo, ')'), GETDATE()
                END
            END

            -- Cantidad
            IF ((SELECT Cantidad FROM deleted) <> (SELECT Cantidad FROM inserted)) BEGIN
                INSERT INTO Auditoria
                SELECT @idNominacion , d.id, 'NominacionDatoTecnicoExportador', 'Cantidad', d.Cantidad, i.Cantidad , GETDATE(), NULL, NULL
                FROM deleted AS d JOIN inserted AS i ON d.Id = i.Id

                IF (@idEmbarque > 0) BEGIN
                    INSERT INTO NotificacionProgramaDeEmbarque (TipoAlerta, Mensaje, Fecha)
                    SELECT 9, CONCAT('Se ha editado el embarque ', @nombreEmbarque, ' - ', @muelle, ': Exportador cantidad (', @exportadorNuevo, ' ', d.Cantidad, ' -> ', i.Cantidad , ')'), GETDATE()
                    FROM deleted D JOIN inserted I ON D.id = I.id
                END
            END

            -- Tolerancia
            IF (
                (SELECT ISNULL(Tolerancia, 0) FROM deleted) <> (SELECT ISNULL(Tolerancia, 0) FROM inserted) OR
                (SELECT ISNULL(ToleranciasDiferenciadas, 0) FROM deleted) <> (SELECT ISNULL(ToleranciasDiferenciadas, 0) FROM inserted) OR
                (SELECT CONCAT(ISNULL(ToleranciaPositiva, 0), ISNULL(ToleranciaNegativa, 0)) FROM deleted) <> (SELECT CONCAT(ISNULL(ToleranciaPositiva, 0), ISNULL(ToleranciaNegativa, 0)) FROM inserted)
            ) BEGIN
                INSERT INTO Auditoria
                SELECT @idNominacion , d.id, 'NominacionDatoTecnicoExportador', 'Tolerancia', 
                    CASE WHEN ISNULL(d.ToleranciasDiferenciadas, 0) = 0 THEN CONVERT(NVARCHAR(MAX), d.Tolerancia) ELSE CONCAT('+', ISNULL(d.ToleranciaPositiva, 0), '% / -', ISNULL(d.ToleranciaNegativa, 0), '%') END, 
                    CASE WHEN ISNULL(i.ToleranciasDiferenciadas, 0) = 0 THEN CONVERT(NVARCHAR(MAX), i.Tolerancia) ELSE CONCAT('+', ISNULL(i.ToleranciaPositiva, 0), '% / -', ISNULL(i.ToleranciaNegativa, 0), '%') END, 
                    GETDATE(), NULL, NULL
                FROM deleted AS d JOIN inserted AS i ON d.Id = i.Id

                IF (@idEmbarque > 0) BEGIN
                    INSERT INTO NotificacionProgramaDeEmbarque (TipoAlerta, Mensaje, Fecha)
                    SELECT 9, CONCAT('Se ha editado el embarque ', @nombreEmbarque, ' - ', @muelle, ': Exportador tolerancia (', @exportadorNuevo, ' ', 
                    CASE WHEN ISNULL(d.ToleranciasDiferenciadas, 0) = 0 THEN CONCAT('+/- ', D.Tolerancia, '%') ELSE CONCAT('+', ISNULL(d.ToleranciaPositiva, 0), '% / -', ISNULL(d.ToleranciaNegativa, 0), '%') END, 
                    ' -> ',  
                    CASE WHEN ISNULL(i.ToleranciasDiferenciadas, 0) = 0 THEN CONCAT('+/- ', I.Tolerancia, '%') ELSE CONCAT('+', ISNULL(i.ToleranciaPositiva, 0), '% / -', ISNULL(i.ToleranciaNegativa, 0), '%') END, 
                    ')'), GETDATE()
                    FROM deleted d JOIN inserted i ON d.id = i.id
                END
            END
        END
        -- INSERT (Excepto que sea en el mismo momento de la creaci�n de la nominaci�n)
        ELSE IF EXISTS (SELECT 1 FROM inserted) AND @dateDiff > 5 BEGIN
            INSERT INTO Auditoria
            SELECT @idNominacion , id, 'NominacionDatoTecnicoExportador', 'Exportador', NULL, @exportadorNuevo, GETDATE(), NULL, NULL
            FROM inserted

            IF (@idEmbarque > 0)  BEGIN
                INSERT INTO NotificacionProgramaDeEmbarque (TipoAlerta, Mensaje, Fecha)
                SELECT 9, CONCAT('Se ha editado el embarque ', @nombreEmbarque, ' - ', @muelle, ': Nuevo exportador (', @exportadorNuevo, ')'), GETDATE()
            END
        END
        -- DELETE
        ELSE IF EXISTS (SELECT 1 FROM deleted) BEGIN
            INSERT INTO Auditoria
            SELECT @idNominacion , id, 'NominacionDatoTecnicoExportador', 'Exportador', @exportadorPrevio, NULL, GETDATE(), NULL, NULL
            FROM deleted

            IF (@idEmbarque > 0)  BEGIN
                INSERT INTO NotificacionProgramaDeEmbarque (TipoAlerta, Mensaje, Fecha)
                SELECT 9, CONCAT('Se ha editado el embarque ', @nombreEmbarque, ' - ', @muelle, ': Exportador eliminado (', @exportadorPrevio, ')'), GETDATE()
            END
        END
    END