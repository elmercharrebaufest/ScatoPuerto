CREATE TABLE [dbo].[RomaneoPuertoComprobante]
(
	[Id] INT IDENTITY (1, 1) NOT NULL PRIMARY KEY, 
    [RomaneoPuerto_Id] INT NOT NULL,
    [NumeroComprobante] INT NOT NULL,
    [Producto] NVARCHAR(100) NOT NULL, 
    [Bodega] NVARCHAR(10) NOT NULL,
    [Exportador] NVARCHAR(200) NOT NULL, 
    [Buque] NVARCHAR(50) NOT NULL, 
    [Destino] NVARCHAR(100) NOT NULL, 
    [FechaCarga] DATETIME NOT NULL,
    [Turno] INT NOT NULL, 
    [Cantidad] INT NOT NULL, 
    [Balanza] INT NOT NULL, 
    CONSTRAINT [FK_dbo.ComprobanteDetalle_dbo.Comprobante_Id] FOREIGN KEY ([RomaneoPuerto_Id]) REFERENCES [RomaneoPuerto]([Id]) ON DELETE CASCADE, 
)
