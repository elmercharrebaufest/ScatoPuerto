CREATE TABLE [dbo].[AcuerdoTipoConfiguracionConcepto]
(
	[Id] INT IDENTITY (1, 1) NOT NULL,
	[AcuerdoTipoConfiguracion_Id] INT NOT NULL,
	[Concepto_Id] INT NOT NULL,
	[Obligatorio] BIT NOT NULL, 
    CONSTRAINT [Pk_AcuerdoTipoConfiguracionConcepto] PRIMARY KEY ([Id]),
	CONSTRAINT [Fk_AcuerdoTipoConfiguracionConcepto_AcuerdoTipoConfiguracion] FOREIGN KEY ([AcuerdoTipoConfiguracion_Id]) REFERENCES [dbo].[AcuerdoTipoConfiguracion]([Id]),
	CONSTRAINT [Fk_AcuerdoTipoConfiguracionConcepto_Concepto] FOREIGN KEY ([Concepto_Id]) REFERENCES [dbo].[Concepto]([Id])
)
