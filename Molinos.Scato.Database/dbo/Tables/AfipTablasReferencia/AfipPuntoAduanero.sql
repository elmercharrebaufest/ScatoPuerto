CREATE TABLE [dbo].[AfipPuntoAduanero]
(
	[Id] INT IDENTITY (1, 1) NOT NULL PRIMARY KEY,
    Codigo NVARCHAR(3) NOT NULL,
    Descripcion NVARCHAR(255) NOT NULL
)
