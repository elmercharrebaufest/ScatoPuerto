CREATE TABLE [dbo].[TarifaPorProductoConcepto]
(
	[Id] INT IDENTITY (1, 1) NOT NULL, 
    [TarifaPorProducto_Id] INT NOT NULL, 
    [Concepto_Id] INT NOT NULL,
    [Valor] DECIMAL(20, 2) NOT NULL, 
    CONSTRAINT [Pk_TarifaPorProductoConcepto] PRIMARY KEY ([Id]),
)
