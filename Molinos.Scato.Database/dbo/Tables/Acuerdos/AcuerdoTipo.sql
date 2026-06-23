CREATE TABLE [dbo].[AcuerdoTipo]
(
	[Id] INT IDENTITY (1, 1) NOT NULL, 
    [Descripcion] NVARCHAR(50) NOT NULL,
	CONSTRAINT [Pk_AcuerdoTipo] PRIMARY KEY ([Id]),
)
