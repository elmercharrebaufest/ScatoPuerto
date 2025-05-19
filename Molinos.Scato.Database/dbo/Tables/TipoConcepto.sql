CREATE TABLE [dbo].[TipoConcepto]
(
	[Id] INT IDENTITY (1, 1) NOT NULL, 
    [Descripcion] VARCHAR(75) NOT NULL,
	CONSTRAINT [Pk_TipoConcepto] PRIMARY KEY ([Id]),
)
