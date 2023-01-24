create table NominacionDatoTecnico(
Id int IDENTITY (1, 1) NOT NULL,
MaterialPuerto_Id  int NOT NULL ,
CantidadTotal int NOT NULL ,
Tolerancia int NULL ,
Observaciones varchar(500) null,
[VaporInformacion_Id] int NOT null,
ETARecalada datetime ,
ObligacionDeCarga datetime, 
MuelleDeCarga_Id int NOT NULL, 
TasaDeCarga_Id int  NULL,
TasaDeCargaValor INT  NULL,
DEM decimal(8,2),
DES decimal(8,2),
TipoDeContrato_Id int  NULL,
ATAPuerto_Id int NULL,
AgenciaMaritimaPuerto_Id int NULL,
Surveyor_Id int NULL,
ObservacionesSurveyor varchar(500),
CONSTRAINT [PK_dbo.NominacionDatoTecnico] PRIMARY KEY CLUSTERED ([Id] ASC),
CONSTRAINT [FK_dbo.NominacionDatoTecnico_dbo.MaterialPuerto_MaterialPuerto_Id] FOREIGN KEY ([MaterialPuerto_Id]) REFERENCES [dbo].[MaterialPuerto] ([Id]),
CONSTRAINT [FK_dbo.NominacionDatoTecnico_dbo.VaporInformacion_VaporInformacion_Id] FOREIGN KEY ([VaporInformacion_Id]) REFERENCES [dbo].[VaporInformacion] ([Id]),
CONSTRAINT [FK_dbo.NominacionDatoTecnico_dbo.MuelleDeCarga_MuelleDeCarga_Id] FOREIGN KEY ([MuelleDeCarga_Id]) REFERENCES [dbo].[MuelleDeCarga] ([Id]),
CONSTRAINT [FK_dbo.NominacionDatoTecnico_dbo.TasaDeCarga_TasaDeCarga_Id] FOREIGN KEY ([TasaDeCarga_Id]) REFERENCES [dbo].[TasaDeCarga] ([Id]),
CONSTRAINT [FK_dbo.NominacionDatoTecnico_dbo.TipoDeContrato_TipoDeContrato_Id] FOREIGN KEY ([TipoDeContrato_Id]) REFERENCES [dbo].[TipoDeContrato] ([Id]),
CONSTRAINT [FK_dbo.NominacionDatoTecnico_dbo.ATAPuerto_ATAPuerto_Id] FOREIGN KEY ([ATAPuerto_Id]) REFERENCES [dbo].[ATAPuerto] ([Id]),
CONSTRAINT [FK_dbo.NominacionDatoTecnico_dbo.AgenciaMaritimaPuerto_AgenciaMaritimaPuerto_Id] FOREIGN KEY ([AgenciaMaritimaPuerto_Id]) REFERENCES [dbo].[AgenciaMaritimaPuerto] ([Id]),
CONSTRAINT [FK_dbo.NominacionDatoTecnico_dbo.Surveyor_Surveyor_Id] FOREIGN KEY ([Surveyor_Id]) REFERENCES [dbo].[Surveyor] ([Id]),

)
GO

CREATE TRIGGER [dbo].[Trigger_NominacionDatoTecnico]
    ON [dbo].[NominacionDatoTecnico]
    FOR  UPDATE
    AS
    BEGIN
       
    declare @idNominacion INT;

    select  @idNominacion = (select n.id from NominacionDatoTecnico dt
    inner join Nominacion n on dt.Id = n.NominacionDatoTecnico_Id
    where dt.Id = (select id from  deleted))


      IF((select MaterialPuerto_Id from deleted) <> (select MaterialPuerto_Id from inserted) )
        BEGIN
        insert into Auditoria
        SELECT @idNominacion , d.id, 'NominacionDatoTecnico', 'MaterialPuerto_Id', d.MaterialPuerto_Id,
	        i.MaterialPuerto_Id , GETDATE()
             FROM deleted AS d
             JOIN inserted AS i
             ON d.Id=i.Id

        END
        IF((select CantidadTotal from deleted) <> (select CantidadTotal from inserted) )
        BEGIN
            insert into Auditoria
            SELECT @idNominacion , d.id, 'NominacionDatoTecnico', 'CantidadTotal', d.CantidadTotal,
	            i.CantidadTotal , GETDATE()
                    FROM deleted AS d
                    JOIN inserted AS i
                    ON d.Id=i.Id

        END

          IF((select Tolerancia from deleted) <> (select Tolerancia from inserted) )
        BEGIN
            insert into Auditoria
            SELECT @idNominacion , d.id, 'NominacionDatoTecnico', 'Tolerancia', d.Tolerancia,
	            i.Tolerancia , GETDATE()
                    FROM deleted AS d
                    JOIN inserted AS i
                    ON d.Id=i.Id

        END
         ELSE IF((select Observaciones from deleted) <> (select Observaciones from inserted) )
        BEGIN
            insert into Auditoria
            SELECT @idNominacion , d.id, 'NominacionDatoTecnico', 'Observaciones', d.Observaciones,
	            i.Observaciones , GETDATE()
                    FROM deleted AS d
                    JOIN inserted AS i
                    ON d.Id=i.Id

        END

        IF((select VaporInformacion_Id from deleted) <> (select VaporInformacion_Id from inserted) )
        BEGIN
            insert into Auditoria
            SELECT @idNominacion , d.id, 'NominacionDatoTecnico', 'VaporInformacion_Id', d.VaporInformacion_Id,
	            i.VaporInformacion_Id , GETDATE()
                    FROM deleted AS d
                    JOIN inserted AS i
                    ON d.Id=i.Id

        END

        IF((select ETARecalada from deleted) <> (select ETARecalada from inserted) )
        BEGIN
            insert into Auditoria
            SELECT @idNominacion , d.id, 'NominacionDatoTecnico', 'ETARecalada', d.ETARecalada,
	            i.ETARecalada , GETDATE()
                    FROM deleted AS d
                    JOIN inserted AS i
                    ON d.Id=i.Id

        END

              IF((select ObligacionDeCarga from deleted) <> (select ObligacionDeCarga from inserted) )
        BEGIN
            insert into Auditoria
            SELECT @idNominacion , d.id, 'NominacionDatoTecnico', 'ObligacionDeCarga', d.ObligacionDeCarga,
	            i.ObligacionDeCarga , GETDATE()
                    FROM deleted AS d
                    JOIN inserted AS i
                    ON d.Id=i.Id

        END

              IF((select MuelleDeCarga_Id from deleted) <> (select MuelleDeCarga_Id from inserted) )
        BEGIN
            insert into Auditoria
            SELECT @idNominacion , d.id, 'NominacionDatoTecnico', 'MuelleDeCarga_Id', d.MuelleDeCarga_Id,
	            i.MuelleDeCarga_Id , GETDATE()
                    FROM deleted AS d
                    JOIN inserted AS i
                    ON d.Id=i.Id

        END

                IF((select TasaDeCarga_Id from deleted) <> (select TasaDeCarga_Id from inserted) )
        BEGIN
            insert into Auditoria
            SELECT @idNominacion , d.id, 'NominacionDatoTecnico', 'TasaDeCarga_Id', d.TasaDeCarga_Id,
	            i.TasaDeCarga_Id , GETDATE()
                    FROM deleted AS d
                    JOIN inserted AS i
                    ON d.Id=i.Id

        END

                IF((select TasaDeCargaValor from deleted) <> (select TasaDeCargaValor from inserted) )
        BEGIN
            insert into Auditoria
            SELECT @idNominacion , d.id, 'NominacionDatoTecnico', 'TasaDeCargaValor', d.TasaDeCargaValor,
	            i.TasaDeCargaValor , GETDATE()
                    FROM deleted AS d
                    JOIN inserted AS i
                    ON d.Id=i.Id

        END

                IF((select DEM from deleted) <> (select DEM from inserted) )
        BEGIN
            insert into Auditoria
            SELECT @idNominacion , d.id, 'NominacionDatoTecnico', 'DEM', d.DEM,
	            i.DEM , GETDATE()
                    FROM deleted AS d
                    JOIN inserted AS i
                    ON d.Id=i.Id

        END

                IF((select deleted.DES from deleted) <> (select inserted.DES from inserted) )
        BEGIN
            insert into Auditoria
            SELECT @idNominacion , d.id, 'NominacionDatoTecnico', 'DES', d.DES,
	            i.DES , GETDATE()
                    FROM deleted AS d
                    JOIN inserted AS i
                    ON d.Id=i.Id

        END

         IF((select TipoDeContrato_Id from deleted) <> (select TipoDeContrato_Id from inserted) )
        BEGIN
            insert into Auditoria
            SELECT @idNominacion , d.id, 'NominacionDatoTecnico', 'TipoDeContrato_Id', d.TipoDeContrato_Id,
	            i.TipoDeContrato_Id , GETDATE()
                    FROM deleted AS d
                    JOIN inserted AS i
                    ON d.Id=i.Id

        END

          ELSE IF((select ATAPuerto_Id from deleted) <> (select ATAPuerto_Id from inserted) )
        BEGIN
            insert into Auditoria
            SELECT @idNominacion , d.id, 'NominacionDatoTecnico', 'ATAPuerto_Id', d.ATAPuerto_Id,
	            i.ATAPuerto_Id , GETDATE()
                    FROM deleted AS d
                    JOIN inserted AS i
                    ON d.Id=i.Id

        END

           IF((select AgenciaMaritimaPuerto_Id from deleted) <> (select AgenciaMaritimaPuerto_Id from inserted) )
        BEGIN
            insert into Auditoria
            SELECT @idNominacion , d.id, 'NominacionDatoTecnico', 'AgenciaMaritimaPuerto_Id', d.AgenciaMaritimaPuerto_Id,
	            i.AgenciaMaritimaPuerto_Id , GETDATE()
                    FROM deleted AS d
                    JOIN inserted AS i
                    ON d.Id=i.Id

        END
            IF((select Surveyor_Id from deleted) <> (select Surveyor_Id from inserted) )
        BEGIN
            insert into Auditoria
            SELECT @idNominacion , d.id, 'NominacionDatoTecnico', 'Surveyor_Id', d.Surveyor_Id,
	            i.Surveyor_Id , GETDATE()
                    FROM deleted AS d
                    JOIN inserted AS i
                    ON d.Id=i.Id

        END
            IF((select ObservacionesSurveyor from deleted) <> (select ObservacionesSurveyor from inserted) )
        BEGIN
            insert into Auditoria
            SELECT @idNominacion , d.id, 'NominacionDatoTecnico', 'ObservacionesSurveyor', d.ObservacionesSurveyor,
	            i.ObservacionesSurveyor , GETDATE()
                    FROM deleted AS d
                    JOIN inserted AS i
                    ON d.Id=i.Id

        END

    END