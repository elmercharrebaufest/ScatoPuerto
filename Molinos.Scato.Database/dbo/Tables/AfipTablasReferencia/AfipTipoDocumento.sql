CREATE TABLE [dbo].[AfipTipoDocumento]
(
	[Id] INT IDENTITY (1, 1) NOT NULL PRIMARY KEY,
    Codigo NVARCHAR(50) NOT NULL,
    Descripcion NVARCHAR(100) NOT NULL
)
