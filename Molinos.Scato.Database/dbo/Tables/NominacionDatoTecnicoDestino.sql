create table NominacionDatoTecnicoDestino(
Id int  IDENTITY (1, 1) NOT NULL,
Destino_Id int  not null,
Cantidad DECIMAL(20, 3) ,
NominacionDatoTecnico_Id int not null,
[CantidadConTolerancia] DECIMAL(20, 3) NULL, 
[CantidadExacta] DECIMAL(20, 3) NULL, 
[Tolerancia] INT NULL, 
CantidadTotalMaxima DECIMAL(20, 3) NULL,
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

	    SELECT  @idNominacion = n.id, @idEmbarque = Embarque_Id, 
                @dateDiff = DATEDIFF(SECOND, n.FechaCreacion, GETDATE()) -- Segundos entre la creación de la nominación y el insert de destino
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

        -- UPDATE
        IF EXISTS (SELECT 1 FROM deleted) AND EXISTS (SELECT 1 FROM inserted) BEGIN 
            IF ((SELECT Destino_Id FROM deleted) <> (SELECT Destino_Id FROM inserted)) BEGIN
                INSERT INTO Auditoria
                SELECT @idNominacion , d.id, 'NominacionDatoTecnicoDestino', 'Destino_Id', d.Destino_Id, i.Destino_Id , GETDATE(), NULL, NULL
                FROM deleted AS d JOIN inserted AS i ON d.Id = i.Id

                IF (@idEmbarque > 0) BEGIN
                    INSERT INTO NotificacionProgramaDeEmbarque (TipoAlerta, Mensaje, Fecha)
                    SELECT 9, CONCAT('Se ha editado el embarque ', @nombreEmbarque, ' - ', @muelle, ': Destino (', @destinoPrevio, ' -> ', @destinoNuevo, ')'), GETDATE()
                END
            END

            IF ((SELECT ISNULL(Cantidad, 0) FROM deleted) <> (SELECT ISNULL(Cantidad, 0) FROM inserted)) BEGIN
                INSERT INTO Auditoria
                SELECT @idNominacion , d.id, 'NominacionDatoTecnicoDestino', 'Cantidad', d.Cantidad, i.Cantidad , GETDATE(), NULL, NULL
                FROM deleted AS d JOIN inserted AS i ON d.Id = i.Id

                IF (@idEmbarque > 0) BEGIN
                    INSERT INTO NotificacionProgramaDeEmbarque (TipoAlerta, Mensaje, Fecha)
                    SELECT 9, CONCAT('Se ha editado el embarque ', @nombreEmbarque, ' - ', @muelle, ': Destino cantidad (', @destinoNuevo, ' ', ISNULL(D.Cantidad, 0), ' -> ', ISNULL(I.Cantidad, 0), ')'), GETDATE()
                    FROM deleted D JOIN inserted I ON D.id = I.id
                END
            END
        END
        -- INSERT (A menos que el insert del destino sea al momento de la creación de la nominación)
        ELSE IF EXISTS (SELECT 1 FROM inserted) AND @dateDiff > 5 BEGIN 
            INSERT INTO Auditoria
            SELECT @idNominacion , id, 'NominacionDatoTecnicoDestino', 'Destino', NULL, @destinoNuevo , GETDATE(), NULL, NULL
            FROM inserted
                
            IF (@idEmbarque > 0) BEGIN
                INSERT INTO NotificacionProgramaDeEmbarque (TipoAlerta, Mensaje, Fecha)
                SELECT 9, CONCAT('Se ha editado el embarque ', @nombreEmbarque, ' - ', @muelle, ': Nuevo destino (', @destinoNuevo, ')'), GETDATE()
            END
        END
        -- DELETE
        ELSE IF EXISTS (SELECT 1 FROM deleted) BEGIN
            INSERT INTO Auditoria
            SELECT @idNominacion , id, 'NominacionDatoTecnicoDestino', 'Destino', @destinoPrevio, NULL , GETDATE(), NULL, NULL
            FROM deleted

            IF (@idEmbarque > 0) BEGIN
                INSERT INTO NotificacionProgramaDeEmbarque (TipoAlerta, Mensaje, Fecha)
                SELECT 9, CONCAT('Se ha editado el embarque ', @nombreEmbarque, ' - ', @muelle, ': Destino eliminado (', @destinoPrevio, ')'), GETDATE()
            END
        END
    END
