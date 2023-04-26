create table NominacionDatoTecnicoDestino(
Id int  IDENTITY (1, 1) NOT NULL,
Destino_Id int  not null,
Cantidad int ,
NominacionDatoTecnico_Id int not null,
CONSTRAINT [PK_dbo.NominacionDatoTecnicoDestino] PRIMARY KEY CLUSTERED ([Id] ASC),
CONSTRAINT [FK_dbo.NominacionDatoTecnicoDestino_dbo.Destino_Destino_Id] FOREIGN KEY ([Destino_Id]) REFERENCES [dbo].[Destino] ([Id]),
CONSTRAINT [FK_dbo.NominacionDatoTecnicoDestino_dbo.NominacionDatoTecnico_NominacionDatoTecnico_Id] FOREIGN KEY ([NominacionDatoTecnico_Id]) REFERENCES [dbo].[NominacionDatoTecnico] ([Id]),
)


GO

CREATE TRIGGER [dbo].[Trigger_NominacionDatoTecnicoDestino]
    ON [dbo].[NominacionDatoTecnicoDestino]
    FOR INSERT, UPDATE, DELETE
    AS
    BEGIN
      
        DECLARE @idNominacion INT,
                @idEmbarque INT,
                @dateDiff INT,
                @muelle NVARCHAR(60),
                @nombreEmbarque NVARCHAR(60),
                @destinoPrevio NVARCHAR(60),
                @destinoNuevo NVARCHAR(60);

	    SELECT @idNominacion = n.id, @idEmbarque = Embarque_Id, @dateDiff = DATEDIFF(MINUTE, n.FechaCreacion, GETDATE())
        FROM nominaciondatotecnicodestino dtd
	    INNER JOIN NominacionDatoTecnico dt ON dtd.NominacionDatoTecnico_Id = dt.Id
	    INNER JOIN Nominacion n ON dt.Id = n.NominacionDatoTecnico_Id
	    WHERE dt.Id = (
            SELECT DISTINCT NominacionDatoTecnico_Id FROM (
                SELECT NominacionDatoTecnico_Id FROM deleted UNION
                SELECT NominacionDatoTecnico_Id FROM inserted
            ) a
            WHERE NominacionDatoTecnico_Id IS NOT NULL
        )

        SELECT @destinoPrevio = D.Nombre from deleted DEL INNER JOIN Destino D ON DEL.Destino_Id = D.Id
        SELECT @destinoNuevo = D.Nombre from inserted I INNER JOIN Destino D ON I.Destino_Id = D.Id

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
            IF((SELECT Destino_Id FROM deleted) <> (SELECT Destino_Id FROM inserted))
            BEGIN
                INSERT INTO Auditoria
                SELECT @idNominacion , d.id, 'NominacionDatoTecnicoDestino', 'Destino_Id', d.Destino_Id, i.Destino_Id , GETDATE()
                FROM deleted AS d JOIN inserted AS i ON d.Id = i.Id

                IF(@idEmbarque > 0) BEGIN
                    INSERT INTO NotificacionProgramaDeEmbarque (TipoAlerta, Mensaje, Fecha)
                    VALUES (9, 'Se ha editado el embarque ' + @nombreEmbarque + ' - ' + @muelle + ': Destino (' + @destinoPrevio + ' -> ' + @destinoNuevo + ')', GETDATE())
                END
            END

            IF((select Cantidad from deleted) <> (select Cantidad from inserted))
            BEGIN
                INSERT INTO Auditoria
                SELECT @idNominacion , d.id, 'NominacionDatoTecnicoDestino', 'Cantidad', d.Cantidad, i.Cantidad , GETDATE()
                FROM deleted AS d JOIN inserted AS i ON d.Id = i.Id

                IF(@idEmbarque > 0) BEGIN
                    INSERT INTO NotificacionProgramaDeEmbarque (TipoAlerta, Mensaje, Fecha)
                    VALUES (9, 'Se ha editado el embarque ' + @nombreEmbarque + ' - ' + @muelle + ': Destino (' + @destinoNuevo + ') cantidad', GETDATE())
                END
            END
        END
        ELSE IF EXISTS (SELECT * FROM inserted) BEGIN -- INSERT
            IF(@dateDiff > 1) BEGIN -- EXCLUYE PRIMER INSERT
                INSERT INTO Auditoria
                SELECT @idNominacion , id, 'NominacionDatoTecnicoDestino', 'Destino', NULL, @destinoNuevo , GETDATE()
                FROM inserted
            END

            IF(@idEmbarque > 0) BEGIN
                INSERT INTO NotificacionProgramaDeEmbarque (TipoAlerta, Mensaje, Fecha)
                VALUES (9, 'Se ha editado el embarque ' + @nombreEmbarque + ' - ' + @muelle + ': Nuevo destino (' + @destinoNuevo + ')', GETDATE())
            END
        END
        ELSE BEGIN -- DELETE
            INSERT INTO Auditoria
            SELECT @idNominacion , id, 'NominacionDatoTecnicoDestino', 'Destino', @destinoPrevio, NULL , GETDATE()
            FROM deleted

            IF (@idEmbarque > 0) BEGIN
                INSERT INTO NotificacionProgramaDeEmbarque (TipoAlerta, Mensaje, Fecha)
                VALUES (9, 'Se ha editado el embarque ' + @nombreEmbarque + ' - ' + @muelle + ': Destino eliminado (' + @destinoPrevio + ')', GETDATE())
            END
        END
    END
