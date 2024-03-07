CREATE TABLE [dbo].[NominacionRecibo](
	[Id] [int] IDENTITY (1, 1) NOT NULL,
	[NumeroRecibo] [int] NULL,
	[Nominacion_Id] [int] NOT NULL,
	[Exportador_Id] [int] NULL,
	[Formato] [varchar](10) NULL,
	[Cantidad] [int] NULL,
	[Unidad] [varchar](10) NULL,
	[Ajuste] [varchar](50) NULL,
	[PuertoDeCarga] [varchar](250) NULL,
	[PuertoDeDescarga] [varchar](250) NULL,
	[DescripcionesBienes] [varchar](250) NULL,
	[RecibosPorDia] BIT NULL,
	[MostrarDestinos] BIT NULL,
	[MostrarBodegas] BIT NULL,
 CONSTRAINT [PK_dbo.NominacionRecibo] PRIMARY KEY CLUSTERED ([Id] ASC),
 CONSTRAINT [FK_dbo.NominacionRecibo_dbo.Exportador_Exportador_Id] FOREIGN KEY([Exportador_Id]) REFERENCES [dbo].[Exportador] ([Id]),
 CONSTRAINT [FK_dbo.NominacionRecibo_dbo.Nominacion_Nominacion_Id] FOREIGN KEY([Nominacion_Id]) REFERENCES [dbo].[Nominacion] ([Id]),
)



GO

CREATE TRIGGER [dbo].[Trigger_NominacionRecibo]
    ON [dbo].[NominacionRecibo]
    FOR INSERT, UPDATE, DELETE
    AS
    BEGIN

        DECLARE @dateDiff INT,
                @idEmbarque INT,
                @muelle NVARCHAR(60),
                @nombreEmbarque NVARCHAR(60),
                @exportadorPrevio NVARCHAR(60),
                @exportadorNuevo NVARCHAR(60),
                @destinoPrevio NVARCHAR(60),
                @destinoNuevo NVARCHAR(60);

        SELECT  @idEmbarque = N.Embarque_Id,
                @dateDiff = DATEDIFF(SECOND, N.FechaCreacion, GETDATE()) -- Segundos entre la creación de la nominación y el insert de Exportador
        FROM Nominacion N
        WHERE N.Id = (SELECT Nominacion_Id FROM deleted UNION SELECT Nominacion_Id FROM inserted);

        SELECT @exportadorPrevio = E.Nombre FROM deleted D INNER JOIN Exportador E ON D.Exportador_Id = E.Id
        SELECT @exportadorNuevo = E.Nombre FROM inserted I INNER JOIN Exportador E ON I.Exportador_Id = E.Id

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
                SELECT d.Nominacion_Id, d.id, 'NominacionRecibo', 'Exportador_Id', d.Exportador_Id, i.Exportador_Id, GETDATE(), NULL
                FROM deleted AS d JOIN inserted AS i ON d.Id = i.Id

                IF (@idEmbarque > 0) BEGIN
                    INSERT INTO NotificacionProgramaDeEmbarque (TipoAlerta, Mensaje, Fecha)
                    SELECT 9, CONCAT('Se ha editado el embarque ', @nombreEmbarque, ' - ', @muelle, ': Exportador Recibo N°', i.NumeroRecibo,
                        ' (', @exportadorPrevio, ' -> ', @exportadorNuevo, ')'), GETDATE() 
                    FROM deleted AS d JOIN inserted AS i ON d.Id = i.Id
                END
            END

            -- Formato
            IF ((SELECT Formato FROM deleted) <> (SELECT Formato FROM inserted)) BEGIN
                INSERT INTO Auditoria
                SELECT d.Nominacion_Id, d.id, 'NominacionRecibo', 'Formato', d.Formato, i.Formato, GETDATE(), NULL
                FROM deleted AS d JOIN inserted AS i ON d.Id = i.Id

                IF (@idEmbarque > 0) BEGIN
                    INSERT INTO NotificacionProgramaDeEmbarque (TipoAlerta, Mensaje, Fecha)
                    SELECT 9, CONCAT('Se ha editado el embarque ', @nombreEmbarque, ' - ', @muelle, ': Formato Recibo N°', i.NumeroRecibo, 
                        ' (', d.Formato, ' -> ', i.Formato, ')'), GETDATE() 
                    FROM deleted AS d JOIN inserted AS i ON d.Id = i.Id
                END
            END

            -- Cantidad
            IF ((SELECT Cantidad FROM deleted) <> (SELECT Cantidad FROM inserted)) BEGIN
                INSERT INTO Auditoria
                SELECT d.Nominacion_Id, d.id, 'NominacionRecibo', 'Cantidad', d.Cantidad, i.Cantidad, GETDATE(), NULL
                FROM deleted AS d JOIN inserted AS i ON d.Id = i.Id

                IF (@idEmbarque > 0) BEGIN
                    INSERT INTO NotificacionProgramaDeEmbarque (TipoAlerta, Mensaje, Fecha)
                    SELECT 9, CONCAT('Se ha editado el embarque ', @nombreEmbarque, ' - ', @muelle, ': Cantidad Recibo N°', i.NumeroRecibo, 
                        ' (', d.Cantidad, ' -> ', i.Cantidad, ')'), GETDATE() 
                    FROM deleted AS d JOIN inserted AS i ON d.Id = i.Id
                END
            END

            -- Unidad
            IF ((SELECT Unidad FROM deleted) <> (SELECT Unidad FROM inserted)) BEGIN
                INSERT INTO Auditoria
                SELECT d.Nominacion_Id, d.id, 'NominacionRecibo', 'Unidad', d.Unidad, i.Unidad, GETDATE(), NULL
                FROM deleted AS d JOIN inserted AS i ON d.Id = i.Id

                IF (@idEmbarque > 0) BEGIN
                    INSERT INTO NotificacionProgramaDeEmbarque (TipoAlerta, Mensaje, Fecha)
                    SELECT 9, CONCAT('Se ha editado el embarque ', @nombreEmbarque, ' - ', @muelle, ': Unidad Recibo N°', i.NumeroRecibo, 
                        ' (', d.Unidad, ' -> ', i.Unidad, ')'), GETDATE() 
                    FROM deleted AS d JOIN inserted AS i ON d.Id = i.Id
                END
            END

            -- Ajuste
            IF ((SELECT Ajuste FROM deleted) <> (SELECT Ajuste FROM inserted)) BEGIN
            INSERT INTO Auditoria
                SELECT d.Nominacion_Id, d.id, 'NominacionRecibo', 'Ajuste', d.Ajuste, i.Ajuste, GETDATE(), NULL
                FROM deleted AS d JOIN inserted AS i ON d.Id = i.Id

                IF (@idEmbarque > 0) BEGIN
                    INSERT INTO NotificacionProgramaDeEmbarque (TipoAlerta, Mensaje, Fecha)
                    SELECT 9, CONCAT('Se ha editado el embarque ', @nombreEmbarque, ' - ', @muelle, ': Ajuste Recibo N°', i.NumeroRecibo, 
                        ' (', d.Ajuste, ' -> ', i.Ajuste, ')'), GETDATE() 
                    FROM deleted AS d JOIN inserted AS i ON d.Id = i.Id
                END
            END

            -- Puerto de Carga
            IF ((SELECT PuertoDeCarga FROM deleted) <> (SELECT PuertoDeCarga FROM inserted)) BEGIN
                INSERT INTO Auditoria
                SELECT d.Nominacion_Id, d.id, 'NominacionRecibo', 'PuertoDeCarga', d.PuertoDeCarga, i.PuertoDeCarga, GETDATE(), NULL
                FROM deleted AS d JOIN inserted AS i ON d.Id = i.Id

                IF (@idEmbarque > 0) BEGIN
                    INSERT INTO NotificacionProgramaDeEmbarque (TipoAlerta, Mensaje, Fecha)
                    SELECT 9, CONCAT('Se ha editado el embarque ', @nombreEmbarque, ' - ', @muelle, ': Puerto de carga Recibo N°', i.NumeroRecibo, 
                        ' (', d.PuertoDeCarga, ' -> ', i.PuertoDeCarga, ')'), GETDATE() 
                    FROM deleted AS d JOIN inserted AS i ON d.Id = i.Id
                END
            END

            -- Puerto de Descarga
            IF ((SELECT PuertoDeDescarga FROM deleted) <> (SELECT PuertoDeDescarga FROM inserted)) BEGIN
                INSERT INTO Auditoria
                SELECT d.Nominacion_Id, d.id, 'NominacionRecibo', 'PuertoDeDescarga', d.PuertoDeDescarga, i.PuertoDeDescarga, GETDATE(), NULL
                FROM deleted AS d JOIN inserted AS i ON d.Id = i.Id

                IF (@idEmbarque > 0) BEGIN
                    INSERT INTO NotificacionProgramaDeEmbarque (TipoAlerta, Mensaje, Fecha)
                    SELECT 9, CONCAT('Se ha editado el embarque ', @nombreEmbarque, ' - ', @muelle, ': Puerto de descarga Recibo N°', i.NumeroRecibo, 
                        ' (', d.PuertoDeDescarga, ' -> ', i.PuertoDeDescarga, ')'), GETDATE() 
                    FROM deleted AS d JOIN inserted AS i ON d.Id = i.Id
                END
            END

            -- Descripcion Bienes
            IF ((SELECT DescripcionesBienes FROM deleted) <> (SELECT DescripcionesBienes FROM inserted)) BEGIN
                INSERT INTO Auditoria
                SELECT d.Nominacion_Id, d.id, 'NominacionRecibo', 'DescripcionesBienes', d.DescripcionesBienes, i.DescripcionesBienes, GETDATE(), NULL
                FROM deleted AS d JOIN inserted AS i ON d.Id = i.Id

                IF (@idEmbarque > 0) BEGIN
                    INSERT INTO NotificacionProgramaDeEmbarque (TipoAlerta, Mensaje, Fecha)
                    SELECT 9, CONCAT('Se ha editado el embarque ', @nombreEmbarque, ' - ', @muelle, ': Descripción de bienes Recibo N°', i.NumeroRecibo), GETDATE() 
                    FROM deleted AS d JOIN inserted AS i ON d.Id = i.Id
                END
            END

            -- Recibos por dia
            IF ((SELECT RecibosPorDia FROM deleted) <> (SELECT RecibosPorDia FROM inserted)) BEGIN
                INSERT INTO Auditoria
                SELECT d.Nominacion_Id, d.id, 'NominacionRecibo', 'RecibosPorDia', d.RecibosPorDia, i.RecibosPorDia, GETDATE(), NULL
                FROM deleted AS d JOIN inserted AS i ON d.Id = i.Id

                IF (@idEmbarque > 0) BEGIN
                    INSERT INTO NotificacionProgramaDeEmbarque (TipoAlerta, Mensaje, Fecha)
                    SELECT 9, CONCAT('Se ha editado el embarque ', @nombreEmbarque, ' - ', @muelle, ': Recibos por día Recibo N°', i.NumeroRecibo, 
                        ' (', CASE d.RecibosPorDia WHEN 1 THEN 'SI' ELSE 'NO' END, ' -> ', CASE i.RecibosPorDia WHEN 1 THEN 'SI' ELSE 'NO' END, ')'), GETDATE() 
                    FROM deleted AS d JOIN inserted AS i ON d.Id = i.Id
                END
            END

            -- Mostrar Destinos
            IF ((SELECT MostrarDestinos FROM deleted) <> (SELECT MostrarDestinos FROM inserted)) BEGIN
                INSERT INTO Auditoria
                SELECT d.Nominacion_Id, d.id, 'NominacionRecibo', 'MostrarDestinos', d.MostrarDestinos, i.MostrarDestinos, GETDATE(), NULL
                FROM deleted AS d JOIN inserted AS i ON d.Id = i.Id

                IF (@idEmbarque > 0) BEGIN
                    INSERT INTO NotificacionProgramaDeEmbarque (TipoAlerta, Mensaje, Fecha)
                    SELECT 9, CONCAT('Se ha editado el embarque ', @nombreEmbarque, ' - ', @muelle, ': Mostrar destinos Recibo N°', i.NumeroRecibo, 
                        ' (', CASE d.RecibosPorDia WHEN 1 THEN 'SI' ELSE 'NO' END, ' -> ', CASE i.RecibosPorDia WHEN 1 THEN 'SI' ELSE 'NO' END, ')'), GETDATE() 
                    FROM deleted AS d JOIN inserted AS i ON d.Id = i.Id
                END
            END

            -- Mostrar Bodegas
            IF ((SELECT MostrarBodegas FROM deleted) <> (SELECT MostrarBodegas FROM inserted)) BEGIN
                INSERT INTO Auditoria
                SELECT d.Nominacion_Id, d.id, 'NominacionRecibo', 'MostrarBodegas', d.MostrarBodegas, i.MostrarBodegas, GETDATE(), NULL
                FROM deleted AS d JOIN inserted AS i ON d.Id = i.Id

                IF (@idEmbarque > 0) BEGIN
                    INSERT INTO NotificacionProgramaDeEmbarque (TipoAlerta, Mensaje, Fecha)
                    SELECT 9, CONCAT('Se ha editado el embarque ', @nombreEmbarque, ' - ', @muelle, ': Mostrar bodegas Recibo N°', i.NumeroRecibo, 
                        ' (', CASE d.MostrarBodegas WHEN 1 THEN 'SI' ELSE 'NO' END, ' -> ', CASE i.MostrarBodegas WHEN 1 THEN 'SI' ELSE 'NO' END, ')'), GETDATE() 
                    FROM deleted AS d JOIN inserted AS i ON d.Id = i.Id
                END
            END
        END
        -- INSERT (Excepto que sea en el mismo momento de la creación de la nominación)
        ELSE IF EXISTS (SELECT 1 FROM inserted) AND (@dateDiff > 5) BEGIN
            INSERT INTO Auditoria
            SELECT Nominacion_Id, id, 'NominacionRecibo', 'Exportador', NULL, NumeroRecibo, GETDATE(), NULL
            FROM inserted

            IF (@idEmbarque > 0) BEGIN
                INSERT INTO NotificacionProgramaDeEmbarque (TipoAlerta, Mensaje, Fecha)
                SELECT 9, CONCAT('Se ha editado el embarque ', @nombreEmbarque, ' - ', @muelle, ': Nuevo Recibo (', NumeroRecibo, ')'), GETDATE()
                FROM inserted
            END
        END
        -- DELETE
        ELSE IF EXISTS (SELECT 1 FROM deleted) BEGIN    
             INSERT INTO Auditoria
            SELECT Nominacion_Id, Id, 'NominacionRecibo', 'Exportador', NumeroRecibo, NULL, GETDATE(), NULL
            FROM deleted

            IF (@idEmbarque > 0) BEGIN
                INSERT INTO NotificacionProgramaDeEmbarque (TipoAlerta, Mensaje, Fecha)
                SELECT 9, CONCAT('Se ha editado el embarque ', @nombreEmbarque, ' - ', @muelle, ': Recibo eliminado (', NumeroRecibo, ')'), GETDATE()
                FROM deleted 
            END
        END
    END