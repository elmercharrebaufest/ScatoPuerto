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
    FOR  UPDATE
    AS
    BEGIN
       
        declare @idNominacion INT;

    select  @idNominacion = (select n.id from NominacionDatoTecnicoExportador dte 
    inner join NominacionDatoTecnico dt on dte.NominacionDatoTecnico_Id = dt.Id
    inner join Nominacion n on dt.Id = n.NominacionDatoTecnico_Id
    where dt.Id = (select id from  deleted))


      IF((select Exportador_Id from deleted) <> (select Exportador_Id from inserted) )
        BEGIN
        insert into Auditoria
        SELECT @idNominacion , d.id, 'NominacionDatoTecnicoExportador', 'Exportador_Id', d.Exportador_Id,
	        i.Exportador_Id , GETDATE()
             FROM deleted AS d
             JOIN inserted AS i
             ON d.Id=i.Id

        END
        ELSE IF((select Cantidad from deleted) <> (select Cantidad from inserted) )
        BEGIN
            insert into Auditoria
            SELECT @idNominacion , d.id, 'NominacionDatoTecnicoExportador', 'Cantidad', d.Cantidad,
	            i.Cantidad , GETDATE()
                    FROM deleted AS d
                    JOIN inserted AS i
                    ON d.Id=i.Id

        END
          ELSE IF((select Tolerancia from deleted) <> (select Tolerancia from inserted) )
        BEGIN
            insert into Auditoria
            SELECT @idNominacion , d.id, 'NominacionDatoTecnicoExportador', 'Tolerancia', d.Tolerancia,
	            i.Tolerancia , GETDATE()
                    FROM deleted AS d
                    JOIN inserted AS i
                    ON d.Id=i.Id

        END

    END