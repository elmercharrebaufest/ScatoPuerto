create table Senasa(
  Id                      int IDENTITY (1, 1) NOT NULL,
  NominacionDetalleIntervencion_Id int NOT NULL,
  Exportador_Id           int NOT NULL,
  TieneSenasa             bit NOT NULL,
  Consumo                 varchar(20) ,
  ACuentaDe               varchar(20) ,
  Destino_Id              int,
  IP                      BIT,
  GMO                     BIT,
  FITO                    BIT,
  MuestraOficial          BIT,
  CertificadoInocuidad    BIT,
  CertificadoVeterinario  BIT,
  Observaciones           varchar(500)
  CONSTRAINT [PK_dbo.Senasa] PRIMARY KEY CLUSTERED ([Id] ASC),
  CONSTRAINT [FK_dbo.Senasa_dbo.Senasa_NominacionDetalleIntervencion_Id] FOREIGN KEY ([NominacionDetalleIntervencion_Id]) REFERENCES [dbo].[NominacionDetalleIntervencion] ([Id]),
  CONSTRAINT [FK_dbo.Senasa_dbo.Senasa_Exportador_Id] FOREIGN KEY ([Exportador_Id]) REFERENCES [dbo].[Exportador] ([Id]),
  CONSTRAINT [FK_dbo.Senasa_dbo.Senasa_Destino_Id] FOREIGN KEY ([Destino_Id]) REFERENCES [dbo].[Destino] ([Id]),

)
GO

CREATE TRIGGER [dbo].[Trigger_Senasa]
    ON [dbo].[Senasa]
    FOR INSERT, UPDATE, DELETE
    AS
    BEGIN
           
        DECLARE @idNominacion INT,
                @dateDiff INT,
                @idEmbarque INT,
                @muelle NVARCHAR(60),
                @nombreEmbarque NVARCHAR(60),
                @exportadorPrevio NVARCHAR(60),
                @exportadorNuevo NVARCHAR(60),
                @destinoPrevio NVARCHAR(60),
                @destinoNuevo NVARCHAR(60);

        SELECT  @idNominacion = n.Id, @idEmbarque = n.Embarque_Id, 
                @dateDiff = DATEDIFF(SECOND, n.FechaCreacion, GETDATE()) -- Segundos entre la creación de la nominación y el insert de Exportador
        FROM Senasa s 
        INNER JOIN NominacionDetalleIntervencion di ON s.NominacionDetalleIntervencion_Id = di.Id
        INNER JOIN Nominacion n ON di.Id = n.NominacionDetalleIntervencion_Id
        WHERE s.Id = (SELECT DISTINCT id FROM (SELECT Id FROM deleted UNION SELECT Id FROM inserted) a)

        SELECT @exportadorPrevio = E.Nombre, @destinoPrevio = DE.Nombre FROM deleted D 
        INNER JOIN Exportador E ON D.Exportador_Id = E.Id
        INNER JOIN Destino DE ON D.Destino_Id = DE.Id

        SELECT @exportadorNuevo = E.Nombre, @destinoNuevo = DE.Nombre FROM inserted I 
        INNER JOIN Exportador E ON I.Exportador_Id = E.Id
        INNER JOIN Destino DE ON I.Destino_Id = DE.Id

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
            IF((SELECT Exportador_Id from deleted) <> (select Exportador_Id from inserted))
            BEGIN
                INSERT INTO Auditoria
                SELECT @idNominacion , d.id, 'Senasa', 'Exportador_Id', d.Exportador_Id, i.Exportador_Id , GETDATE()
                FROM deleted AS d JOIN inserted AS i ON d.Id = i.Id

                --IF (@idEmbarque > 0) BEGIN
                --    INSERT INTO NotificacionProgramaDeEmbarque (TipoAlerta, Mensaje, Fecha)
                --    SELECT 9, CONCAT('Se ha editado el embarque ', @nombreEmbarque, ' - ', @muelle, ': Exportador SENASA (', @exportadorPrevio, ' -> ', @exportadorNuevo, ')'), GETDATE()
                --END
            END

            -- Tiene Senasa
            IF ((SELECT TieneSenasa FROM deleted) <> (SELECT TieneSenasa FROM inserted))
            BEGIN
                INSERT INTO Auditoria
                SELECT @idNominacion , d.id, 'Senasa', 'TieneSenasa', d.TieneSenasa, i.TieneSenasa , GETDATE()
                FROM deleted AS d JOIN inserted AS i ON d.Id = i.Id

                IF (@idEmbarque > 0) BEGIN
                    INSERT INTO NotificacionProgramaDeEmbarque (TipoAlerta, Mensaje, Fecha)
                    SELECT 9, CONCAT('Se ha editado el embarque ', @nombreEmbarque, ' - ', @muelle, ': SENASA ', @exportadorNuevo,
                        CASE d.TieneSenasa WHEN 1 THEN '(SI' ELSE '(NO' END, ' -> ', CASE i.TieneSenasa WHEN 1 THEN 'SI)' ELSE 'NO)' END), GETDATE()
                    FROM deleted AS d JOIN inserted AS i ON d.Id = i.Id
                END
            END

            -- Consumo
            IF ((SELECT Consumo FROM deleted) <> (SELECT Consumo FROM inserted))
            BEGIN
                INSERT INTO Auditoria
                SELECT @idNominacion , d.id, 'Senasa', 'Consumo', d.Consumo, i.Consumo , GETDATE()
                FROM deleted AS d JOIN inserted AS i ON d.Id = i.Id

                --IF (@idEmbarque > 0) BEGIN
                --    INSERT INTO NotificacionProgramaDeEmbarque (TipoAlerta, Mensaje, Fecha)
                --    SELECT 9, CONCAT('Se ha editado el embarque ', @nombreEmbarque, ' - ', @muelle, ': SENASA ', @exportadorNuevo, ' Consumo (', d.Consumo, ' -> ', i.Consumo, ')'), GETDATE()
                --    FROM deleted AS d JOIN inserted AS i ON d.Id = i.Id
                --END
            END

            -- A Cuenta De
            IF((SELECT ACuentaDe FROM deleted) <> (SELECT ACuentaDe FROM inserted)) BEGIN
                INSERT INTO Auditoria
                SELECT @idNominacion , d.id, 'Senasa', 'ACuentaDe', d.ACuentaDe, i.ACuentaDe , GETDATE()
                FROM deleted AS d JOIN inserted AS i ON d.Id = i.Id

                --IF (@idEmbarque > 0) BEGIN
                --    INSERT INTO NotificacionProgramaDeEmbarque (TipoAlerta, Mensaje, Fecha)
                --    SELECT 9, CONCAT('Se ha editado el embarque ', @nombreEmbarque, ' - ', @muelle, ': SENASA ', @exportadorNuevo, ' A cuenta de (', d.ACuentaDe, ' -> ', i.ACuentaDe, ')'), GETDATE()
                --    FROM deleted AS d JOIN inserted AS i ON d.Id = i.Id
                --END
            END

            -- Destino
            IF ((SELECT Destino_Id FROM deleted) <> (SELECT Destino_Id FROM inserted)) BEGIN
                insert into Auditoria
                SELECT @idNominacion , d.id, 'Senasa', 'Destino_Id', d.Destino_Id, i.Destino_Id , GETDATE()
                FROM deleted AS d JOIN inserted AS i ON d.Id = i.Id

                --IF (@idEmbarque > 0) BEGIN
                --    INSERT INTO NotificacionProgramaDeEmbarque (TipoAlerta, Mensaje, Fecha)
                --    SELECT 9, CONCAT('Se ha editado el embarque ', @nombreEmbarque, ' - ', @muelle, ': SENASA ', @exportadorNuevo, ' Destino (', @destinoPrevio, ' -> ', @destinoNuevo, ')'), GETDATE()
                --END
            END

            -- IP
            IF ((SELECT [IP] FROM deleted) <> (SELECT [IP] FROM inserted)) BEGIN
                INSERT INTO Auditoria
                SELECT @idNominacion , d.id, 'Senasa', 'IP', d.[IP], i.[IP] , GETDATE()
                FROM deleted AS d JOIN inserted AS i ON d.Id = i.Id

                --IF (@idEmbarque > 0) BEGIN
                --    INSERT INTO NotificacionProgramaDeEmbarque (TipoAlerta, Mensaje, Fecha)
                --    SELECT 9, CONCAT('Se ha editado el embarque ', @nombreEmbarque, ' - ', @muelle, ': SENASA ', @exportadorNuevo, ' IP (', 
                --        CASE d.[IP] WHEN 1 THEN 'SI' ELSE 'NO' END, ' -> ', CASE i.[IP] WHEN 1 THEN 'SI' ELSE 'NO' END, ')'), GETDATE()
                --    FROM deleted AS d JOIN inserted AS i ON d.Id = i.Id
                --END
            END
      
            -- GMO
            IF ((SELECT GMO FROM deleted) <> (SELECT GMO FROM inserted)) BEGIN
                INSERT INTO Auditoria
                SELECT @idNominacion , d.id, 'Senasa', 'GMO', d.GMO, i.GMO , GETDATE()
                FROM deleted AS d JOIN inserted AS i ON d.Id = i.Id

                --IF (@idEmbarque > 0) BEGIN
                --    INSERT INTO NotificacionProgramaDeEmbarque (TipoAlerta, Mensaje, Fecha)
                --    SELECT 9, CONCAT('Se ha editado el embarque ', @nombreEmbarque, ' - ', @muelle, ': SENASA ', @exportadorNuevo, ' GMO (', 
                --        CASE d.GMO WHEN 1 THEN 'SI' ELSE 'NO' END, ' -> ', CASE i.GMO WHEN 1 THEN 'SI' ELSE 'NO' END, ')'), GETDATE()
                --    FROM deleted AS d JOIN inserted AS i ON d.Id = i.Id
                --END
            END

            -- FITO
            IF ((SELECT FITO FROM deleted) <> (SELECT FITO FROM inserted)) BEGIN
                INSERT INTO Auditoria
                SELECT @idNominacion , d.id, 'Senasa', 'FITO', d.FITO, i.FITO , GETDATE()
                FROM deleted AS d JOIN inserted AS i ON d.Id = i.Id

                --IF (@idEmbarque > 0) BEGIN
                --    INSERT INTO NotificacionProgramaDeEmbarque (TipoAlerta, Mensaje, Fecha)
                --    SELECT 9, CONCAT('Se ha editado el embarque ', @nombreEmbarque, ' - ', @muelle, ': SENASA ', @exportadorNuevo, ' FITO (', 
                --        CASE d.FITO WHEN 1 THEN 'SI' ELSE 'NO' END, ' -> ', CASE i.FITO WHEN 1 THEN 'SI' ELSE 'NO' END, ')'), GETDATE()
                --    FROM deleted AS d JOIN inserted AS i ON d.Id = i.Id
                --END
            END

            -- Muestra Oficial
            IF ((SELECT MuestraOficial FROM deleted) <> (SELECT MuestraOficial FROM inserted)) BEGIN
                INSERT INTO Auditoria
                SELECT @idNominacion , d.id, 'Senasa', 'MuestraOficial', d.MuestraOficial, i.MuestraOficial , GETDATE()
                FROM deleted AS d JOIN inserted AS i ON d.Id = i.Id

                --IF (@idEmbarque > 0) BEGIN
                --    INSERT INTO NotificacionProgramaDeEmbarque (TipoAlerta, Mensaje, Fecha)
                --    SELECT 9, CONCAT('Se ha editado el embarque ', @nombreEmbarque, ' - ', @muelle, ': SENASA ', @exportadorNuevo, ' Muestra Oficial (', 
                --        CASE d.MuestraOficial WHEN 1 THEN 'SI' ELSE 'NO' END, ' -> ', CASE i.MuestraOficial WHEN 1 THEN 'SI' ELSE 'NO' END, ')'), GETDATE()
                --    FROM deleted AS d JOIN inserted AS i ON d.Id = i.Id
                --END
            END

            -- Certificado Inocuidad
            IF ((SELECT CertificadoInocuidad FROM deleted) <> (SELECT CertificadoInocuidad FROM inserted)) BEGIN
                INSERT INTO Auditoria
                SELECT @idNominacion , d.id, 'Senasa', 'CertificadoInocuidad', d.CertificadoInocuidad, i.CertificadoInocuidad , GETDATE()
                FROM deleted AS d JOIN inserted AS i ON d.Id = i.Id

                --IF (@idEmbarque > 0) BEGIN
                --    INSERT INTO NotificacionProgramaDeEmbarque (TipoAlerta, Mensaje, Fecha)
                --    SELECT 9, CONCAT('Se ha editado el embarque ', @nombreEmbarque, ' - ', @muelle, ': SENASA ', @exportadorNuevo, ' Certificado inocuidad (', 
                --        CASE d.CertificadoInocuidad WHEN 1 THEN 'SI' ELSE 'NO' END, ' -> ', CASE i.CertificadoInocuidad WHEN 1 THEN 'SI' ELSE 'NO' END, ')'), GETDATE()
                --    FROM deleted AS d JOIN inserted AS i ON d.Id = i.Id
                --END
            END

            -- Certificado Veterinario
            IF ((SELECT CertificadoVeterinario FROM deleted) <> (SELECT CertificadoVeterinario from inserted)) BEGIN
                INSERT INTO Auditoria
                SELECT @idNominacion , d.id, 'Senasa', 'CertificadoVeterinario', d.CertificadoVeterinario, i.CertificadoVeterinario , GETDATE()
                FROM deleted AS d JOIN inserted AS i ON d.Id = i.Id

                --IF (@idEmbarque > 0) BEGIN
                --    INSERT INTO NotificacionProgramaDeEmbarque (TipoAlerta, Mensaje, Fecha)
                --    SELECT 9, CONCAT('Se ha editado el embarque ', @nombreEmbarque, ' - ', @muelle, ': SENASA ', @exportadorNuevo, ' Certificado veterinario (', 
                --        CASE d.CertificadoVeterinario WHEN 1 THEN 'SI' ELSE 'NO' END, ' -> ', CASE i.CertificadoVeterinario WHEN 1 THEN 'SI' ELSE 'NO' END, ')'), GETDATE()
                --    FROM deleted AS d JOIN inserted AS i ON d.Id = i.Id
                --END
            END

            -- Observaciones
            IF ((SELECT Observaciones FROM deleted) <> (SELECT Observaciones FROM inserted)) BEGIN
                INSERT INTO Auditoria
                SELECT @idNominacion , d.id, 'Senasa', 'Observaciones', d.Observaciones, i.Observaciones , GETDATE()
                FROM deleted AS d JOIN inserted AS i ON d.Id = i.Id

                --IF (@idEmbarque > 0) BEGIN
                --    INSERT INTO NotificacionProgramaDeEmbarque (TipoAlerta, Mensaje, Fecha)
                --    SELECT 9, CONCAT('Se ha editado el embarque ', @nombreEmbarque, ' - ', @muelle, ': SENASA ', @exportadorNuevo, ' Observaciones'), GETDATE()
                --    FROM deleted AS d JOIN inserted AS i ON d.Id = i.Id
                --END
            END
        END
        -- INSERT (Excepto que sea en el mismo momento de la creación de la nominación)
        ELSE IF EXISTS (SELECT 1 FROM inserted) AND (@dateDiff > 5) BEGIN
            INSERT INTO Auditoria
            SELECT @idNominacion , id, 'Senasa', 'Exportador', NULL, @exportadorNuevo, GETDATE()
            FROM inserted

            --IF (@idEmbarque > 0) BEGIN
            --    INSERT INTO NotificacionProgramaDeEmbarque (TipoAlerta, Mensaje, Fecha)
            --    SELECT 9, CONCAT('Se ha editado el embarque ', @nombreEmbarque, ' - ', @muelle, ': Nuevo SENASA (', @exportadorNuevo, ')'), GETDATE()
            --END
        END
        -- DELETE
        ELSE IF EXISTS (SELECT 1 FROM deleted) BEGIN
            INSERT INTO Auditoria
            SELECT @idNominacion, Id, 'Senasa', 'Exportador', @exportadorPrevio, NULL, GETDATE()
            FROM deleted

            --IF (@idEmbarque > 0) BEGIN
            --    INSERT INTO NotificacionProgramaDeEmbarque (TipoAlerta, Mensaje, Fecha)
            --    SELECT 9, CONCAT('Se ha editado el embarque ', @nombreEmbarque, ' - ', @muelle, ': SENASA eliminado (', @exportadorPrevio, ')'), GETDATE()
            --END
        END
    END