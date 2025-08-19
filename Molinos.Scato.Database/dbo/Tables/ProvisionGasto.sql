CREATE TABLE [dbo].[ProvisionGasto]
(
	[Id] INT IDENTITY (1, 1) NOT NULL, 
    [TarifaPorEmbarque_Id] INT NOT NULL, 
    [FechaCierre] DATETIME NULL, 
    [UsuarioCierre] NVARCHAR(150) NULL,
    CONSTRAINT [Pk_ProvisionGasto] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_dbo.ProvisionGasto_dbo.TarifaPorEmbarque_TarifaPorEmbarque_Id] FOREIGN KEY ([TarifaPorEmbarque_Id]) REFERENCES [dbo].[TarifaPorEmbarque] ([Id]),
)
