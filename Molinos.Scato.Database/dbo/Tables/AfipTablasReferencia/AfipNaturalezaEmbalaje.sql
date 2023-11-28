CREATE TABLE [dbo].[AfipNaturalezaEmbalaje]
(
	[Id] INT IDENTITY (1, 1) NOT NULL PRIMARY KEY,
    [Codigo] NVARCHAR(2) NOT NULL,
    [Descripcion] NVARCHAR(100) NOT NULL
)
