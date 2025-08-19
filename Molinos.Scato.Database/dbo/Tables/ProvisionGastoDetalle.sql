CREATE TABLE [dbo].[ProvisionGastoDetalle]
(
	[Id] INT IDENTITY (1, 1) NOT NULL, 
    [ProvisionGasto_Id] INT NOT NULL, 
    [TarifaPorEmbarqueConcepto_Id] INT NULL, 
    [ValorCalculado] DECIMAL(20, 2) NOT NULL, 
    [ValorAjustado] DECIMAL(20, 2) NULL,
    CONSTRAINT [Pk_ProvisionGastoDetalle] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_dbo.ProvisionGastoDetalle_dbo.TarifaPorEmbarqueConcepto_TarifaPorEmbarqueConcepto_Id] FOREIGN KEY ([TarifaPorEmbarqueConcepto_Id]) REFERENCES [dbo].[TarifaPorEmbarqueConcepto] ([Id]),
)
