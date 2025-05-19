CREATE TABLE [dbo].[TipoTarifa]
(
	[Id] INT IDENTITY (1, 1) NOT NULL,
	[Descripcion] VARCHAR(75) NOT NULL, 
    CONSTRAINT [Pk_TipoTarifa] PRIMARY KEY ([Id]),
)
