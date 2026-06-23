CREATE TABLE [dbo].[AcuerdoTipoConfiguracion]
(
	[Id] INT IDENTITY (1, 1) NOT NULL,
	[AcuerdoTipo_Id] INT NOT NULL,
	[EsSanBenito] BIT NOT NULL, 
    [EsMOA] BIT NOT NULL, 
    CONSTRAINT [Pk_AcuerdoTipoConfiguracion] PRIMARY KEY ([Id]),
	CONSTRAINT [Fk_AcuerdoTipoConfiguracion_AcuerdoTipo] FOREIGN KEY ([AcuerdoTipo_Id]) REFERENCES [dbo].[AcuerdoTipo]([Id])
)
