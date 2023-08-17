CREATE TABLE [dbo].[AfipPuerto]
(
	[Id] INT IDENTITY (1, 1) NOT NULL PRIMARY KEY,
    Codigo NVARCHAR(50),
    Descripcion NVARCHAR(100),
    VigenciaDesde INT,
    VigenciaHasta INT,
    Pais INT,
    Aduana NVARCHAR(50)
)
