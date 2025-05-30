CREATE TABLE [dbo].[TarifaPorEmbarque]
(
	[Id] INT IDENTITY (1, 1) NOT NULL, 
    [Embarque_Id] INT NOT NULL, 
    [Exportador_Id] INT NOT NULL, 
    [MaterialPuerto_Id] INT NOT NULL,
    [Periodo] DATE NOT NULL, 
    [Cerrado] BIT NOT NULL DEFAULT 0,
    [TipoContratoTarifa_Id] INT NULL,
    CONSTRAINT [Pk_TarifaPorEmbarque] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_dbo.TarifaPorEmbarque_dbo.Embarque_Embarque_Id] FOREIGN KEY ([Embarque_Id]) REFERENCES [dbo].[Embarque] ([Id]),
    CONSTRAINT [FK_dbo.TarifaPorEmbarque_dbo.MaterialPuerto_MaterialPuerto_Id] FOREIGN KEY ([MaterialPuerto_Id]) REFERENCES [dbo].[MaterialPuerto] ([Id]),
    CONSTRAINT [FK_dbo.TarifaPorEmbarque_dbo.Exportador_Exportador_Id] FOREIGN KEY ([Exportador_Id]) REFERENCES [dbo].[Exportador] ([Id]),
    CONSTRAINT [FK_dbo.TarifaPorEmbarque_dbo.TipoContratoTarifa_TipoContratoTarifa_Id] FOREIGN KEY ([TipoContratoTarifa_Id]) REFERENCES [dbo].[TipoContratoTarifa] ([Id]),
    CONSTRAINT [UQ_MaterialPuerto_Periodo_Embarque_Exportador] UNIQUE ([MaterialPuerto_Id], [Exportador_Id], [Embarque_Id])
)
