CREATE TABLE [dbo].[Muelle]
(
	[Id] INT IDENTITY (1, 1) NOT NULL, 
    [Descripcion] NVARCHAR(50) NOT NULL, 
    [SectorResponsableDeCargas] NVARCHAR(100) NOT NULL, 
    [FormaIngresoCarga] NVARCHAR(150) NOT NULL, 
    [IngresoManual] BIT NOT NULL,
    CONSTRAINT [PK_Muelle] PRIMARY KEY ([Id])
)
