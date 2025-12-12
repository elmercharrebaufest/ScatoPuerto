CREATE TABLE [dbo].[ComprobanteDeEmbarque]
(
	[Id] INT IDENTITY (1,1) NOT NULL PRIMARY KEY, 
    [TipoComprobante_Id] INT NOT NULL, 
    [ModuloDeCarga_Id] INT NOT NULL, 
    [Buque] NVARCHAR(50) NOT NULL, 
    [NumeroComprobante] INT NOT NULL, 
    [CantidadPaginas] INT NOT NULL, 
    [FechaEmision] DATETIME NOT NULL,
    [UsuarioEmision] NVARCHAR(200) NULL, 
    [FechaImpresion] DATETIME NULL, 
    [Estado] INT NOT NULL,
    [FechaEliminacion] DATETIME NULL, 
    [UsuarioEliminacion] NVARCHAR(200) NULL, 
    [UbicacionArchivo] NVARCHAR(300) NULL, 
    [FechaETA] NVARCHAR(10) NULL, 
    CONSTRAINT [FK_dbo.ComprobanteDeEmbarque_dbo.ModuloDeCarga_Id] FOREIGN KEY ([ModuloDeCarga_Id]) REFERENCES [ModuloDeCarga]([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_dbo.ComprobanteDeEmbarque_dbo.TipoComprobante_Id] FOREIGN KEY ([TipoComprobante_Id]) REFERENCES [TipoComprobante]([Id]) ON DELETE CASCADE,
)
