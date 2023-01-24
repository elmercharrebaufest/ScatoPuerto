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
    FOR  delete
    AS
    BEGIN
        declare @idNominacion INT;

    select  @idNominacion = (select n.id from NominacionDatoTecnicoCalidad dt 
    inner join Nominacion n on dt.Id = n.NominacionDatoTecnico_Id
    where dt.Id = (select id from  deleted))


        insert into Auditoria
        SELECT @idNominacion , d.id, 'NominacionDatoTecnicoCalidad', 'CalidadValor_Id', d.CalidadValor_Id,
	        d.CalidadValor_Id , GETDATE()
             FROM deleted AS d


      

    END