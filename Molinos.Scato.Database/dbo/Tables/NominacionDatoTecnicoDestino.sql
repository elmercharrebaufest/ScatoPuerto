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
    FOR  UPDATE
    AS
    BEGIN
      
        declare @idNominacion INT;

	  select  @idNominacion = (select n.id from nominaciondatotecnicodestino dtd
	inner join NominacionDatoTecnico dt on dtd.NominacionDatoTecnico_Id = dt.Id
	inner join Nominacion n on dt.Id = n.NominacionDatoTecnico_Id
	where dtd.Id = (select id from  deleted))


        IF((select Destino_Id from deleted) <> (select Destino_Id from inserted) )
        BEGIN
        insert into Auditoria
        SELECT @idNominacion , d.id, 'NominacionDatoTecnicoDestino', 'CompaniaACuentaDe', d.Destino_Id,
	        i.Destino_Id , GETDATE()
             FROM deleted AS d
             JOIN inserted AS i
             ON d.Id=i.Id

        END
        ELSE IF((select Cantidad from deleted) <> (select Cantidad from inserted) )
        BEGIN
        insert into Auditoria
        SELECT @idNominacion , d.id, 'NominacionDatoTecnicoDestino', 'CompaniaACuentaDe', d.Cantidad,
	        i.Cantidad , GETDATE()
             FROM deleted AS d
             JOIN inserted AS i
             ON d.Id=i.Id

        END
    END
