CREATE TABLE [dbo].[LineaPorMuelle]
(
	[Id] INT NOT NULL PRIMARY KEY IDENTITY (1, 1), 
    [MuelleDeCarga_Id] INT NOT NULL, 
    [TipoLineaEmbarque_Id] INT NOT NULL,
    CONSTRAINT [FK_dbo.LineaPorMuelle_dbo.MuelleDeCarga_MuelleDeCarga_Id] FOREIGN KEY ([MuelleDeCarga_Id]) REFERENCES [dbo].[MuelleDeCarga] ([Id]),
    CONSTRAINT [FK_dbo.LineaPorMuelle_dbo.TipoLineaEmbarque_Linea_Id] FOREIGN KEY ([TipoLineaEmbarque_Id]) REFERENCES [dbo].[TipoLineaEmbarque] ([Id])
)
