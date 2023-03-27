CREATE TABLE [dbo].[NominacionDatoTecnicoCalidad]
(
	Id INT IDENTITY (1, 1) NOT NULL,
	CalidadValor_Id INT NOT NULL,
	NominacionDatoTecnico_Id INT NOT NULL,
	CONSTRAINT [PK_dbo.NominacionDatoTecnicoCalidad] PRIMARY KEY CLUSTERED ([Id] ASC),
	CONSTRAINT [FK_dbo.NominacionDatoTecnicoCalidad_dbo.CalidadValor_CalidadValor_Id] FOREIGN KEY ([CalidadValor_Id]) REFERENCES [dbo].[CalidadValor] ([Id]),
	CONSTRAINT [FK_dbo.NominacionDatoTecnicoCalidad_dbo.NominacionDatoTecnico_NominacionDatoTecnico_Id] FOREIGN KEY ([NominacionDatoTecnico_Id]) REFERENCES [dbo].[NominacionDatoTecnico] ([Id]),
)

GO


CREATE TRIGGER [dbo].[Trigger_NominacionDatoTecnicoCalidad]
    ON [dbo].[NominacionDatoTecnicoCalidad]
    FOR  UPDATE
    AS
    BEGIN
       
        declare @idNominacion INT;
 
	select  @idNominacion = (select n.id from NominacionDatoTecnicoCalidad dtc 
    inner join NominacionDatoTecnico dt on dtc.NominacionDatoTecnico_Id = dt.Id
    inner join Nominacion n on dt.Id = n.NominacionDatoTecnico_Id
    where dt.Id = (select id from  deleted))


      IF((select CalidadValor_Id from deleted) <> (select CalidadValor_Id from inserted) )
        BEGIN

		 insert into Auditoria
        SELECT @idNominacion , d.id, 'NominacionDatoTecnicoCalidad', 'CalidadValor_Id', d.CalidadValor_Id,
	        i.CalidadValor_Id , GETDATE()
             FROM deleted AS d
			  JOIN inserted AS i
             ON d.Id=i.Id

        END
        

    END