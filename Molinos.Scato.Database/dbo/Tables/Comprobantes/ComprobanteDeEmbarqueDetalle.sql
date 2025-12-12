CREATE TABLE [dbo].[ComprobanteDeEmbarqueDetalle]
(
	[Id] INT IDENTITY (1, 1) NOT NULL PRIMARY KEY, 
    [ComprobanteDeEmbarque_Id] INT NOT NULL,
    [NumeroComprobante] INT NULL,
    [Producto] NVARCHAR(100) NOT NULL, 
    [Bodega] NVARCHAR(10) NOT NULL,
    [Exportador] NVARCHAR(200) NOT NULL, 
    [Destino] NVARCHAR(100) NOT NULL, 
    [FechaCarga] DATETIME NOT NULL,
    [Turno] INT NOT NULL, 
    [Cantidad] INT NOT NULL, 
    [Balanza] INT NOT NULL,
    [FechaInicioCarga] DATETIME NULL,
    [FechaFinCarga] DATETIME NULL,
    CONSTRAINT [FK_dbo.ComprobanteDeEmbarqueDetalle_dbo.ComprobanteDeEmbarque_Id] FOREIGN KEY ([ComprobanteDeEmbarque_Id]) REFERENCES [ComprobanteDeEmbarque]([Id]) ON DELETE CASCADE, 
)
