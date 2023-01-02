CREATE TABLE [dbo].[NominacionDatoTecnicoCalidad]
(
	Id INT IDENTITY (1, 1) NOT NULL,
	CalidadValor_Id INT NOT NULL,
	NominacionDatoTecnico_Id INT NOT NULL,
	CONSTRAINT [PK_dbo.NominacionDatoTecnicoCalidad] PRIMARY KEY CLUSTERED ([Id] ASC),
	CONSTRAINT [FK_dbo.NominacionDatoTecnicoCalidad_dbo.CalidadValor_CalidadValor_Id] FOREIGN KEY ([CalidadValor_Id]) REFERENCES [dbo].[CalidadValor] ([Id]),
	CONSTRAINT [FK_dbo.NominacionDatoTecnicoCalidad_dbo.NominacionDatoTecnico_NominacionDatoTecnico_Id] FOREIGN KEY ([NominacionDatoTecnico_Id]) REFERENCES [dbo].[NominacionDatoTecnico] ([Id]),
)
