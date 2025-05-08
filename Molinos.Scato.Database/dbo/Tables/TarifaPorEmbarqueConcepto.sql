CREATE TABLE [dbo].[TarifaPorEmbarqueConcepto]
(
	[Id] INT IDENTITY (1, 1) NOT NULL, 
    [TarifaPorEmbarque_Id] INT NOT NULL, 
    [Concepto_Id] INT NOT NULL,
    CONSTRAINT [Pk_TarifaPorEmbarqueConcepto] PRIMARY KEY ([Id]),
)
