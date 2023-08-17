CREATE TABLE [dbo].[AfipPais]
(
	[Id] INT IDENTITY (1, 1) NOT NULL PRIMARY KEY,
    [Codigo] NVARCHAR(3) NOT NULL,
    [Descripcion] NVARCHAR(50) NOT NULL,
    [VigenciaDesde] INT NOT NULL,
    [VigenciaHasta] INT NOT NULL,
    [Pais] NVARCHAR(50) NOT NULL,
    [Aduana] NVARCHAR(50) NOT NULL
)
