CREATE TABLE [dbo].[TarifaPorProducto]
(
	[Id] INT IDENTITY (1, 1) NOT NULL, 
    [MaterialPuerto_Id] INT NOT NULL, 
    [Periodo] DATE NOT NULL,
    [Cerrado] BIT NOT NULL DEFAULT 0,
    CONSTRAINT [Pk_TarifaPorProducto] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_dbo.TarifaPorProducto_dbo.MaterialPuerto_MaterialPuerto_Id] FOREIGN KEY ([MaterialPuerto_Id]) REFERENCES [dbo].[MaterialPuerto] ([Id]),
    CONSTRAINT [UQ_MaterialPuerto_Periodo] UNIQUE ([MaterialPuerto_Id], [Periodo])
)
