create table NominacionDatoTecnicoExportador(
Id int IDENTITY (1, 1) NOT NULL,
Exportador_Id int not null,
Cantidad int not null,
Tolerancia int NULL,
NominacionDatoTecnico_Id  int not null,
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

        SELECT @idNominacion = n.Id, @idEmbarque = n.Embarque_Id, @dateDiff = DATEDIFF(MINUTE, n.FechaCreacion, GETDATE())
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

        IF EXISTS (SELECT * FROM deleted) AND EXISTS (SELECT * FROM inserted) BEGIN -- UPDATE
            -- Exportador
            IF((SELECT Exportador_Id FROM deleted) <> (SELECT Exportador_Id FROM inserted) )
            BEGIN
                INSERT INTO Auditoria
                SELECT @idNominacion , d.id, 'NominacionDatoTecnicoExportador', 'Exportador_Id', d.Exportador_Id, i.Exportador_Id , GETDATE()
                FROM deleted AS d JOIN inserted AS i ON d.Id = i.Id

                IF(@idEmbarque > 0) BEGIN
                    INSERT INTO NotificacionProgramaDeEmbarque (TipoAlerta, Mensaje, Fecha)
                    VALUES (9, 'Se ha editado el embarque ' + @nombreEmbarque + ' - ' + @muelle + ': Exportador (' + @exportadorPrevio + ' -> ' + @exportadorNuevo + ')', GETDATE())
                END
            END

            -- Cantidad
            IF((SELECT Cantidad FROM deleted) <> (SELECT Cantidad FROM inserted) )
            BEGIN
                INSERT INTO Auditoria
                SELECT @idNominacion , d.id, 'NominacionDatoTecnicoExportador', 'Cantidad', d.Cantidad, i.Cantidad , GETDATE() 
                FROM deleted AS d JOIN inserted AS i ON d.Id = i.Id

                IF(@idEmbarque > 0) BEGIN
                    INSERT INTO NotificacionProgramaDeEmbarque (TipoAlerta, Mensaje, Fecha)
                    VALUES (9, 'Se ha editado el embarque ' + @nombreEmbarque + ' - ' + @muelle + ': Exportador cantidad (' + 
                    (select @exportadorNuevo + ' ' + CAST(d.Cantidad   AS VARCHAR)+ ' -> ' + CAST(i.Cantidad  AS VARCHAR) FROM deleted D JOIN inserted I ON D.id = I.id ) + ')', getdate())
                END
            END

            -- Tolerancia
            IF((SELECT Tolerancia FROM deleted) <> (SELECT Tolerancia FROM inserted) )
            BEGIN
                INSERT INTO Auditoria
                SELECT @idNominacion , d.id, 'NominacionDatoTecnicoExportador', 'Tolerancia', d.Tolerancia, i.Tolerancia , GETDATE()
                FROM deleted AS d JOIN inserted AS i ON d.Id = i.Id

                IF(@idEmbarque > 0) BEGIN
                    INSERT INTO NotificacionProgramaDeEmbarque (TipoAlerta, Mensaje, Fecha)
                    VALUES (9, 'Se ha editado el embarque ' + @nombreEmbarque + ' - ' + @muelle + ': Exportador tolerancia (' + 
                        (SELECT @exportadorNuevo + ' ' + CAST(D.Tolerancia   AS VARCHAR) + ' -> ' + CAST(I.Tolerancia AS VARCHAR) FROM deleted D JOIN inserted I ON D.id = I.id ) + ')', GETDATE())
                END
            END
        END
        ELSE IF EXISTS (SELECT * FROM inserted) BEGIN -- INSERT
            IF(@dateDiff > 1) BEGIN -- EXCLUYE PRIMER INSERT
                INSERT INTO Auditoria
                SELECT @idNominacion , id, 'NominacionDatoTecnicoExportador', 'Exportador', NULL, @exportadorNuevo, GETDATE()
                FROM inserted
            END

            IF (@idEmbarque > 0)  BEGIN
                INSERT INTO NotificacionProgramaDeEmbarque (TipoAlerta, Mensaje, Fecha)
                VALUES (9, 'Se ha editado el embarque ' + @nombreEmbarque + ' - ' + @muelle + ': Nuevo exportador (' + @exportadorNuevo + ')', GETDATE())
            END
        END
        ELSE BEGIN -- DELETE
            INSERT INTO Auditoria
            SELECT @idNominacion , id, 'NominacionDatoTecnicoExportador', 'Exportador', @exportadorPrevio, NULL, GETDATE()
            FROM deleted

            IF (@idEmbarque > 0)  BEGIN
                INSERT INTO NotificacionProgramaDeEmbarque (TipoAlerta, Mensaje, Fecha)
                VALUES (9, 'Se ha editado el embarque ' + @nombreEmbarque + ' - ' + @muelle + ': Exportador eliminado (' + @exportadorPrevio + ')', GETDATE())
            END
        END
    END