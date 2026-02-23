CREATE TABLE [dbo].[OtroMuelleCargaDetalle]
(
	[Id] INT IDENTITY (1, 1) NOT NULL, 
	[OtroMuelleCarga_Id] INT NOT NULL, 
    [FechaHoraInicio] DATETIME NOT NULL, 
    [FechaHoraFin] DATETIME NOT NULL, 
    [Exportador_Id] INT NOT NULL, 
    [Destino_Id] INT NOT NULL, 
    [MaterialPuerto_Id] INT NOT NULL, 
    [TipoMaterial] NVARCHAR(20) NOT NULL, 
    [CantidadTn] DECIMAL(10, 3) NOT NULL,
    CONSTRAINT [PK_OtroMuelleCargaDetalle] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_OtroMuelleCargaDetalle_OtroMuelleCarga] FOREIGN KEY ([OtroMuelleCarga_Id]) REFERENCES [dbo].[OtroMuelleCarga]([Id])
)
