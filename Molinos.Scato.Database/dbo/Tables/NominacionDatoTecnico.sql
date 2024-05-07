CREATE TABLE NominacionDatoTecnico (
	Id INT IDENTITY(1, 1) NOT NULL,
	MaterialPuerto_Id INT NOT NULL,
	CantidadTotal INT NOT NULL,
	Tolerancia INT NULL,
	Observaciones VARCHAR(500) NULL,
	[VaporInformacion_Id] INT NOT NULL,
	ETARecalada DATETIME,
	ObligacionDeCarga DATETIME,
	MuelleDeCarga_Id INT NOT NULL,
	TasaDeCarga_Id INT NULL,
	TasaDeCargaValor INT NULL,
	DEM DECIMAL(8, 2),
	DES DECIMAL(8, 2),
	TipoDeContrato_Id INT NULL,
	ATAPuerto_Id INT NULL,
	AgenciaMaritimaPuerto_Id INT NULL,
	Surveyor_Id INT NULL,
	ObservacionesSurveyor VARCHAR(500),

	CONSTRAINT [PK_dbo.NominacionDatoTecnico] PRIMARY KEY CLUSTERED ([Id] ASC),
	CONSTRAINT [FK_dbo.NominacionDatoTecnico_dbo.MaterialPuerto_MaterialPuerto_Id] FOREIGN KEY ([MaterialPuerto_Id]) REFERENCES [dbo].[MaterialPuerto]([Id]),
	CONSTRAINT [FK_dbo.NominacionDatoTecnico_dbo.VaporInformacion_VaporInformacion_Id] FOREIGN KEY ([VaporInformacion_Id]) REFERENCES [dbo].[VaporInformacion]([Id]),
	CONSTRAINT [FK_dbo.NominacionDatoTecnico_dbo.MuelleDeCarga_MuelleDeCarga_Id] FOREIGN KEY ([MuelleDeCarga_Id]) REFERENCES [dbo].[MuelleDeCarga]([Id]),
	CONSTRAINT [FK_dbo.NominacionDatoTecnico_dbo.TasaDeCarga_TasaDeCarga_Id] FOREIGN KEY ([TasaDeCarga_Id]) REFERENCES [dbo].[TasaDeCarga]([Id]),
	CONSTRAINT [FK_dbo.NominacionDatoTecnico_dbo.TipoDeContrato_TipoDeContrato_Id] FOREIGN KEY ([TipoDeContrato_Id]) REFERENCES [dbo].[TipoDeContrato]([Id]),
	CONSTRAINT [FK_dbo.NominacionDatoTecnico_dbo.ATAPuerto_ATAPuerto_Id] FOREIGN KEY ([ATAPuerto_Id]) REFERENCES [dbo].[ATAPuerto]([Id]),
	CONSTRAINT [FK_dbo.NominacionDatoTecnico_dbo.AgenciaMaritimaPuerto_AgenciaMaritimaPuerto_Id] FOREIGN KEY ([AgenciaMaritimaPuerto_Id]) REFERENCES [dbo].[AgenciaMaritimaPuerto]([Id]),
	CONSTRAINT [FK_dbo.NominacionDatoTecnico_dbo.Surveyor_Surveyor_Id] FOREIGN KEY ([Surveyor_Id]) REFERENCES [dbo].[Surveyor]([Id])
)
GO

CREATE TRIGGER [dbo].[Trigger_NominacionDatoTecnico] ON [dbo].[NominacionDatoTecnico]
FOR UPDATE, INSERT
AS
BEGIN
	DECLARE @idNominacion INT;
	DECLARE @idEmbarque INT;
	DECLARE @muelle NVARCHAR(60);
	DECLARE @nombreEmbarque NVARCHAR(60);
	DECLARE @nuevoBuque NVARCHAR(60);

	SELECT @idNominacion = n.id, @idEmbarque = n.Embarque_Id
	FROM NominacionDatoTecnico dt INNER JOIN Nominacion n ON dt.Id = n.NominacionDatoTecnico_Id
	WHERE dt.Id = (SELECT id FROM deleted)

	SELECT @nombreEmbarque = e.Patente, @muelle = (
		SELECT CASE 
		WHEN e.Vicentin = 'true'	THEN 'Vicentin'
		WHEN e.Noryon = 'true'		THEN 'Noryon'
		WHEN e.SanBenito = 'true'	THEN 'San Benito'
		ELSE 'Otros muelles' END
	)
	FROM Embarque e WHERE e.Id = @idEmbarque

	IF ((SELECT MaterialPuerto_Id FROM deleted) <> (SELECT MaterialPuerto_Id FROM inserted)) BEGIN
		INSERT INTO Auditoria
		SELECT @idNominacion, d.id, 'NominacionDatoTecnico', 'MaterialPuerto_Id', d.MaterialPuerto_Id, i.MaterialPuerto_Id, GETDATE(), NULL, NULL
		FROM deleted AS d JOIN inserted AS i ON d.Id = i.Id

		IF (@idEmbarque > 0) BEGIN
			INSERT INTO NotificacionProgramaDeEmbarque ([TipoAlerta], [Mensaje], [Fecha])
			VALUES (9, 'Se ha editado el embarque ' + @nombreEmbarque + ' - ' + @muelle + ': Propiedad -> MaterialPuerto.', GETDATE())
		END
	END

	IF ((SELECT CantidadTotal FROM deleted) <> (SELECT CantidadTotal FROM inserted)) BEGIN
		INSERT INTO Auditoria
		SELECT @idNominacion, d.id, 'NominacionDatoTecnico', 'CantidadTotal', d.CantidadTotal, i.CantidadTotal, GETDATE(), NULL, NULL
		FROM deleted AS d JOIN inserted AS i ON d.Id = i.Id

		IF (@idEmbarque > 0) BEGIN
			INSERT INTO NotificacionProgramaDeEmbarque ([TipoAlerta], [Mensaje], [Fecha])
			VALUES (9, 'Se ha editado el embarque ' + @nombreEmbarque + ' - ' + @muelle + ': Propiedad -> CantidadTotal.', GETDATE())
		END
	END

	IF ((SELECT ISNULL(Tolerancia, 0) FROM deleted) <> (SELECT ISNULL(Tolerancia, 0) FROM inserted)) BEGIN
		INSERT INTO Auditoria
		SELECT @idNominacion, d.id, 'NominacionDatoTecnico', 'Tolerancia', d.Tolerancia, i.Tolerancia, GETDATE(), NULL, NULL
		FROM deleted AS d JOIN inserted AS i ON d.Id = i.Id

		IF (@idEmbarque > 0) BEGIN
			INSERT INTO NotificacionProgramaDeEmbarque ([TipoAlerta], [Mensaje], [Fecha])
			VALUES (9, 'Se ha editado el embarque ' + @nombreEmbarque + ' - ' + @muelle + ': Propiedad -> Tolerancia.', GETDATE())
		END
	END
	
	IF ((SELECT ISNULL(Observaciones, '') FROM deleted) <> (SELECT ISNULL(Observaciones, '') FROM inserted)) BEGIN
		INSERT INTO Auditoria
		SELECT @idNominacion, d.id, 'NominacionDatoTecnico', 'Observaciones', d.Observaciones, i.Observaciones, GETDATE(), NULL, NULL
		FROM deleted AS d JOIN inserted AS i ON d.Id = i.Id

		IF (@idEmbarque > 0) BEGIN
			INSERT INTO NotificacionProgramaDeEmbarque ([TipoAlerta], [Mensaje], [Fecha])
			VALUES (9, 'Se ha editado el embarque ' + @nombreEmbarque + ' - ' + @muelle + ': Propiedad -> Observaciones.', GETDATE())
		END
	END

	-- El buque en teoría no debería poder cambiar
	IF ((SELECT VaporInformacion_Id FROM deleted) <> (SELECT VaporInformacion_Id FROM inserted)) BEGIN
		INSERT INTO Auditoria
		SELECT @idNominacion, d.id, 'NominacionDatoTecnico', 'VaporInformacion_Id', d.VaporInformacion_Id, i.VaporInformacion_Id, GETDATE(), NULL, NULL
		FROM deleted AS d JOIN inserted AS i ON d.Id = i.Id

		SELECT @nuevoBuque = NombreBuque
		FROM VaporInformacion v INNER JOIN inserted i ON V.Id = i.VaporInformacion_Id


		IF (@idEmbarque > 0) BEGIN
			INSERT INTO NotificacionProgramaDeEmbarque ([TipoAlerta], [Mensaje], [Fecha])
			VALUES (9, 'Se ha editado el embarque ' + @nombreEmbarque + ' - ' + @muelle + ': Cambio de Buque (' + @nombreEmbarque + ' -> ' + @nuevoBuque + ')', GETDATE())
		END
	END

	IF ((SELECT ETARecalada FROM deleted) <> (SELECT ETARecalada FROM inserted)) BEGIN
		INSERT INTO Auditoria
		SELECT @idNominacion, d.id, 'NominacionDatoTecnico', 'ETARecalada', d.ETARecalada, i.ETARecalada, GETDATE(), NULL, NULL
		FROM deleted AS d JOIN inserted AS i ON d.Id = i.Id

		IF (@idEmbarque > 0) BEGIN
			INSERT INTO NotificacionProgramaDeEmbarque ([TipoAlerta], [Mensaje], [Fecha])
			VALUES (9, 'Se ha editado el embarque ' + @nombreEmbarque + ' - ' + @muelle + ': Propiedad -> Eta.', GETDATE())
		END
	END

	IF ((SELECT ObligacionDeCarga FROM deleted) <> (SELECT ObligacionDeCarga FROM inserted)) BEGIN
		INSERT INTO Auditoria
		SELECT @idNominacion, d.id, 'NominacionDatoTecnico', 'ObligacionDeCarga', d.ObligacionDeCarga, i.ObligacionDeCarga, GETDATE(), NULL, NULL
		FROM deleted AS d JOIN inserted AS i ON d.Id = i.Id

		IF (@idEmbarque > 0) BEGIN
			INSERT INTO NotificacionProgramaDeEmbarque ([TipoAlerta], [Mensaje], [Fecha])
			VALUES (9, 'Se ha editado el embarque ' + @nombreEmbarque + ' - ' + @muelle + ': Propiedad -> ObligacionDeCarga.', GETDATE())
		END
	END

	IF ((SELECT ISNULL(MuelleDeCarga_Id, 0) FROM deleted) <> (SELECT ISNULL(MuelleDeCarga_Id, 0) FROM inserted)) BEGIN
		INSERT INTO Auditoria
		SELECT @idNominacion, d.id, 'NominacionDatoTecnico', 'MuelleDeCarga_Id', d.MuelleDeCarga_Id, i.MuelleDeCarga_Id, GETDATE(), NULL, NULL
		FROM deleted AS d JOIN inserted AS i ON d.Id = i.Id

		IF (@idEmbarque > 0) BEGIN
			INSERT INTO NotificacionProgramaDeEmbarque ([TipoAlerta], [Mensaje], [Fecha])
			VALUES (9, 'Se ha editado el embarque ' + @nombreEmbarque + ' - ' + @muelle + ': Propiedad -> Muelle de carga.', GETDATE())
		END
	END

	IF ((SELECT ISNULL(TasaDeCarga_Id, 0) FROM deleted) <> (SELECT ISNULL(TasaDeCarga_Id, 0) FROM inserted)) BEGIN
		INSERT INTO Auditoria
		SELECT @idNominacion, d.id, 'NominacionDatoTecnico', 'TasaDeCarga', d.TasaDeCarga_Id, i.TasaDeCarga_Id, GETDATE(), NULL, NULL
		FROM deleted AS d JOIN inserted AS i ON d.Id = i.Id

		IF (@idEmbarque > 0) BEGIN
			INSERT INTO NotificacionProgramaDeEmbarque ([TipoAlerta], [Mensaje], [Fecha])
			VALUES (9, 'Se ha editado el embarque ' + @nombreEmbarque + ' - ' + @muelle + ': Propiedad -> Tasa.', GETDATE())
		END
	END

	IF ((SELECT ISNULL(TasaDeCargaValor, 0) FROM deleted) <> (SELECT ISNULL(TasaDeCargaValor, 0) FROM inserted)) BEGIN
		INSERT INTO Auditoria
		SELECT @idNominacion, d.id, 'NominacionDatoTecnico', 'TasaDeCargaValor', d.TasaDeCargaValor, i.TasaDeCargaValor, GETDATE(), NULL, NULL
		FROM deleted AS d JOIN inserted AS i ON d.Id = i.Id

		IF (@idEmbarque > 0) BEGIN
			INSERT INTO NotificacionProgramaDeEmbarque ([TipoAlerta], [Mensaje], [Fecha])
			VALUES (9, 'Se ha editado el embarque ' + @nombreEmbarque + ' - ' + @muelle + ': Propiedad -> Tasa valor.', GETDATE())
		END
	END

	IF ((SELECT ISNULL(DEM, 0) FROM deleted) <> (SELECT ISNULL(DEM, 0) FROM inserted)) BEGIN
		INSERT INTO Auditoria
		SELECT @idNominacion, d.id, 'NominacionDatoTecnico', 'DEM', d.DEM, i.DEM, GETDATE(), NULL, NULL
		FROM deleted AS d JOIN inserted AS i ON d.Id = i.Id

		IF (@idEmbarque > 0) BEGIN
			INSERT INTO NotificacionProgramaDeEmbarque ([TipoAlerta], [Mensaje], [Fecha])
			VALUES (9, 'Se ha editado el embarque ' + @nombreEmbarque + ' - ' + @muelle + ': Propiedad -> DEM.', GETDATE())
		END
	END

	IF ((SELECT ISNULL([DES], 0) FROM deleted) <> (SELECT ISNULL([DES], 0) FROM inserted)) BEGIN
		INSERT INTO Auditoria
		SELECT @idNominacion, d.id, 'NominacionDatoTecnico', 'DES', d.DES, i.DES, GETDATE(), NULL, NULL
		FROM deleted AS d JOIN inserted AS i ON d.Id = i.Id

		IF (@idEmbarque >0) BEGIN
			INSERT INTO NotificacionProgramaDeEmbarque ([TipoAlerta], [Mensaje], [Fecha])
			VALUES (9, 'Se ha editado el embarque ' + @nombreEmbarque + ' - ' + @muelle + ': Propiedad -> DES.', GETDATE())
		END
	END

	IF ((SELECT ISNULL(TipoDeContrato_Id, 0) FROM deleted) <> (SELECT ISNULL(TipoDeContrato_Id, 0) FROM inserted)) BEGIN
		INSERT INTO Auditoria
		SELECT @idNominacion, d.id, 'NominacionDatoTecnico', 'TipoDeContrato', d.TipoDeContrato_Id, i.TipoDeContrato_Id, GETDATE(), NULL, NULL
		FROM deleted AS d JOIN inserted AS i ON d.Id = i.Id

		IF (@idEmbarque > 0) BEGIN
			INSERT INTO NotificacionProgramaDeEmbarque ([TipoAlerta], [Mensaje], [Fecha])
			VALUES (9, 'Se ha editado el embarque ' + @nombreEmbarque + ' - ' + @muelle + ': Propiedad -> Contrato.', GETDATE())
		END
	END
	
	IF ((SELECT ISNULL(ATAPuerto_Id, 0) FROM deleted) <> (SELECT ISNULL(ATAPuerto_Id, 0) FROM inserted)) BEGIN
		INSERT INTO Auditoria
		SELECT @idNominacion, d.id, 'NominacionDatoTecnico', 'ATAPuerto', d.ATAPuerto_Id, i.ATAPuerto_Id, GETDATE(), NULL, NULL
		FROM deleted AS d JOIN inserted AS i ON d.Id = i.Id

		IF (@idEmbarque > 0) BEGIN
			INSERT INTO NotificacionProgramaDeEmbarque ([TipoAlerta], [Mensaje], [Fecha])
			VALUES (9, 'Se ha editado el embarque ' + @nombreEmbarque + ' - ' + @muelle + ': Propiedad -> ATA.', GETDATE())
		END
	END

	IF ((SELECT ISNULL(AgenciaMaritimaPuerto_Id, 0) FROM deleted) <> (SELECT ISNULL(AgenciaMaritimaPuerto_Id, 0) FROM inserted)) BEGIN
		INSERT INTO Auditoria
		SELECT @idNominacion,d.id, 'NominacionDatoTecnico', 'AgenciaMaritimaPuerto', d.AgenciaMaritimaPuerto_Id, i.AgenciaMaritimaPuerto_Id, GETDATE(), NULL, NULL
		FROM deleted AS d JOIN inserted AS i ON d.Id = i.Id

		IF (@idEmbarque > 0) BEGIN
			INSERT INTO NotificacionProgramaDeEmbarque ([TipoAlerta], [Mensaje], [Fecha])
			VALUES (9, 'Se ha editado el embarque ' + @nombreEmbarque + ' - ' + @muelle + ': Propiedad -> Agencia Maritima.', GETDATE())
		END
	END

	IF ((SELECT ISNULL(Surveyor_Id, 0) FROM deleted) <> (SELECT ISNULL(Surveyor_Id, 0) FROM inserted)) BEGIN
		INSERT INTO Auditoria
		SELECT @idNominacion, d.id, 'NominacionDatoTecnico', 'Surveyor', d.Surveyor_Id, i.Surveyor_Id, GETDATE(), NULL, NULL
		FROM deleted AS d JOIN inserted AS i ON d.Id = i.Id

		IF (@idEmbarque > 0) BEGIN
			INSERT INTO NotificacionProgramaDeEmbarque ([TipoAlerta], [Mensaje], [Fecha])
			VALUES (9, 'Se ha editado el embarque ' + @nombreEmbarque + ' - ' + @muelle + ': Propiedad -> Surveyor.', GETDATE())
		END
	END

	IF ((SELECT ISNULL(ObservacionesSurveyor, '') FROM deleted) <> (SELECT ISNULL(ObservacionesSurveyor, '') FROM inserted)) BEGIN
		INSERT INTO Auditoria
		SELECT @idNominacion, d.id, 'NominacionDatoTecnico', 'ObservacionesSurveyor', d.ObservacionesSurveyor, i.ObservacionesSurveyor, GETDATE(), NULL, NULL
		FROM deleted AS d JOIN inserted AS i ON d.Id = i.Id

		IF (@idEmbarque > 0) BEGIN
			INSERT INTO NotificacionProgramaDeEmbarque ([TipoAlerta], [Mensaje], [Fecha])
			VALUES (9, 'Se ha editado el embarque ' + @nombreEmbarque + ' - ' + @muelle + ': Propiedad -> Observaciones Surveyor.', GETDATE())
		END
	END
END