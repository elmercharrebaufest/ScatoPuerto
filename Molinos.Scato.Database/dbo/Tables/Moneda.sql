CREATE TABLE [dbo].[Moneda]
(
	[Id] INT IDENTITY (1, 1) NOT NULL, 
	[Descripcion] VARCHAR(100) NOT NULL, 
    CONSTRAINT [Pk_Moneda] PRIMARY KEY ([Id]),
)
