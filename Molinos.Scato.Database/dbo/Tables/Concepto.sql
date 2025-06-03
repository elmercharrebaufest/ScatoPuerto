CREATE TABLE [dbo].[Concepto]
(
	[Id] INT IDENTITY (1, 1) NOT NULL, 
    [Descripcion] VARCHAR(100) NOT NULL, 
    [TipoConcepto_Id] INT NOT NULL,
	[Moneda_Id] INT NOT NULL, 
    [TipoTarifa_Id] INT NOT NULL, 
    [PresentaAjuste] BIT NOT NULL, 
    [PorProducto] BIT NOT NULL DEFAULT 0, 
    [PorEmbarque] BIT NOT NULL DEFAULT 0, 
    CONSTRAINT [Pk_Concepto] PRIMARY KEY ([Id]),
)
