create table NominacionDatoTecnicoCoordinadorPuerto(
Id int IDENTITY (1, 1) NOT NULL,
CoordinadorPuerto_Id int not null,
Cantidad int ,
NominacionDatoTecnico_Id int not null,
CONSTRAINT [PK_dbo.NominacionDatoTecnicoCoordinadorPuerto] PRIMARY KEY CLUSTERED ([Id] ASC),
CONSTRAINT [FK_dbo.NominacionDatoTecnicoCoordinadorPuerto_dbo.NominacionDatoTecnico_NominacionDatoTecnico_Id] FOREIGN KEY ([NominacionDatoTecnico_Id]) REFERENCES [dbo].[NominacionDatoTecnico] ([Id]),
CONSTRAINT [FK_dbo.NominacionDatoTecnicoCoordinadorPuerto_dbo.CoordinadorPuerto_CoordinadorPuerto_Id] FOREIGN KEY ([CoordinadorPuerto_Id]) REFERENCES [dbo].[CoordinadorPuerto] ([Id]),

)
GO

CREATE TRIGGER [dbo].[Trigger_NominacionDatoTecnicoCoordinadorPuerto]
    ON [dbo].[NominacionDatoTecnicoCoordinadorPuerto]
    FOR INSERT, UPDATE
    AS
    BEGIN
        
        DECLARE @idNominacion INT,
                @idEmbarque INT,
                @muelle NVARCHAR(60),
                @nombreEmbarque NVARCHAR(60);

        SELECT @idNominacion = n.Id, @idEmbarque = n.Embarque_Id 
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

        IF (@idEmbarque > 0) BEGIN
            SELECT @nombreEmbarque = Patente,
            @muelle = CASE 
                WHEN Vicentin = 'true' THEN 'Vicentin'
                WHEN Noryon = 'true' THEN 'Noryon'
                WHEN SanBenito = 'true' THEN 'San Benito'
                ELSE 'Otros muelles' END
            FROM Embarque WHERE Id = @idEmbarque
        END

        IF EXISTS (SELECT * FROM deleted) AND EXISTS (SELECT * FROM inserted) BEGIN -- UPDATE
            IF((SELECT CoordinadorPuerto_Id FROM deleted) <> (SELECT CoordinadorPuerto_Id FROM inserted) )
            BEGIN
                INSERT INTO Auditoria
                SELECT @idNominacion, d.id, 'NominacionDatoTecnicoCoordinadorPuerto', 'CoordinadorPuerto_Id', d.CoordinadorPuerto_Id, i.CoordinadorPuerto_Id , GETDATE()
                FROM deleted AS d JOIN inserted AS i ON d.Id = i.Id

                IF(@idEmbarque > 0) BEGIN
                    INSERT INTO NotificacionProgramaDeEmbarque (TipoAlerta, Mensaje, Fecha)
                    VALUES (9, 'Se ha editado el embarque ' + @nombreEmbarque + ' - ' + @muelle + ': Propiedad -> Cliente', GETDATE())
                END
            END

            IF((SELECT Cantidad FROM deleted) <> (SELECT Cantidad FROM inserted) )
            BEGIN
                INSERT INTO Auditoria
                SELECT @idNominacion , d.id, 'NominacionDatoTecnicoCoordinadorPuerto', 'Cantidad', d.Cantidad, i.Cantidad , GETDATE()
                FROM deleted AS d JOIN inserted AS i ON d.Id = i.Id
                IF(@idEmbarque > 0) BEGIN
                    INSERT INTO NotificacionProgramaDeEmbarque (TipoAlerta, Mensaje, Fecha)
                    VALUES (9, 'Se ha editado el embarque ' + @nombreEmbarque + ' - ' + @muelle + ': Propiedad -> Cliente cantidad', GETDATE())
                END
            END
        END
        ELSE IF EXISTS (SELECT * FROM inserted) AND (@idEmbarque > 0) BEGIN -- INSERT
            INSERT INTO NotificacionProgramaDeEmbarque (TipoAlerta, Mensaje, Fecha)
            VALUES (9, 'Se ha editado el embarque ' + @nombreEmbarque + ' - ' + @muelle + ': Propiedad -> Nuevo cliente', GETDATE())
        END
        ELSE IF (@idEmbarque > 0) BEGIN -- DELETE
            INSERT INTO NotificacionProgramaDeEmbarque (TipoAlerta, Mensaje, Fecha)
            VALUES (9, 'Se ha editado el embarque ' + @nombreEmbarque + ' - ' + @muelle + ': Propiedad -> Cliente removido', GETDATE())
        END
    END