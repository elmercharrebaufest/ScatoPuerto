CREATE TABLE [dbo].[NominacionDatoTecnicoCalidad]
(
	Id INT IDENTITY (1, 1) NOT NULL,
	CalidadValor_Id INT NOT NULL,
	NominacionDatoTecnico_Id INT NOT NULL,
	[CalidadValorEditado] VARCHAR(250) NULL, 
    CONSTRAINT [PK_dbo.NominacionDatoTecnicoCalidad] PRIMARY KEY CLUSTERED ([Id] ASC),
	CONSTRAINT [FK_dbo.NominacionDatoTecnicoCalidad_dbo.CalidadValor_CalidadValor_Id] FOREIGN KEY ([CalidadValor_Id]) REFERENCES [dbo].[CalidadValor] ([Id]),
	CONSTRAINT [FK_dbo.NominacionDatoTecnicoCalidad_dbo.NominacionDatoTecnico_NominacionDatoTecnico_Id] FOREIGN KEY ([NominacionDatoTecnico_Id]) REFERENCES [dbo].[NominacionDatoTecnico] ([Id]),
)

GO


CREATE TRIGGER [dbo].[Trigger_NominacionDatoTecnicoCalidad]
    ON [dbo].[NominacionDatoTecnicoCalidad]
    FOR UPDATE
    AS
    BEGIN
       
        DECLARE @idNominacion INT;
 
	    SELECT @idNominacion = (SELECT n.id FROM NominacionDatoTecnicoCalidad dtc 
        INNER JOIN NominacionDatoTecnico dt ON dtc.NominacionDatoTecnico_Id = dt.Id
        INNER JOIN Nominacion n ON dt.Id = n.NominacionDatoTecnico_Id
        WHERE dt.Id = (SELECT id FROM deleted))

        IF((SELECT ISNULL(CalidadValor_Id, 0) FROM deleted) <> (SELECT ISNULL(CalidadValor_Id, 0) FROM inserted)) BEGIN
            INSERT INTO Auditoria
            SELECT @idNominacion , d.id, 'NominacionDatoTecnicoCalidad', 'CalidadValor_Id', d.CalidadValor_Id, i.CalidadValor_Id , GETDATE(), NULL, NULL
            FROM deleted AS d JOIN inserted AS i ON d.Id = i.Id
        END
    END