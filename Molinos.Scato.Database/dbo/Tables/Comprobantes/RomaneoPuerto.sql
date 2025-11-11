CREATE TABLE [dbo].[RomaneoPuerto]
(
	[Id] INT IDENTITY (1,1) NOT NULL PRIMARY KEY, 
    [ModuloDeCarga_Id] INT NOT NULL, 
    [NumeroRomaneo] INT NOT NULL, 
    [CantidadPaginas] INT NOT NULL, 
    [FechaEmision] DATETIME NOT NULL,
    [UsuarioEmision] NVARCHAR(200) NULL, 
    [FechaImpresion] DATETIME NULL, 
    [Estado] INT NOT NULL,
    [FechaEliminacion] DATETIME NULL, 
    [UsuarioEliminacion] NVARCHAR(200) NULL, 
    CONSTRAINT [FK_dbo.Romaneo_dbo.ModuloDeCarga_Id] FOREIGN KEY ([ModuloDeCarga_Id]) REFERENCES [ModuloDeCarga]([Id]) ON DELETE CASCADE,
)
