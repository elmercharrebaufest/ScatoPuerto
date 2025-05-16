CREATE TABLE [dbo].[TarifaPorEmbarqueConcepto]
(
	[Id] INT IDENTITY (1, 1) NOT NULL, 
    [TarifaPorEmbarque_Id] INT NOT NULL, 
    [Concepto_Id] INT NOT NULL,
    [Valor] DECIMAL(20, 2) NOT NULL, 
    CONSTRAINT [Pk_TarifaPorEmbarqueConcepto] PRIMARY KEY ([Id]),
)
