CREATE TABLE [dbo].[AfipPuerto]
(
	[Id] INT IDENTITY (1, 1) NOT NULL PRIMARY KEY,
    Codigo NVARCHAR(50) NOT NULL,
    Descripcion NVARCHAR(100) NOT NULL,
    VigenciaDesde INT NOT NULL,
    VigenciaHasta INT NOT NULL,
    Pais INT NOT NULL,
    Aduana NVARCHAR(50) NOT NULL
)
