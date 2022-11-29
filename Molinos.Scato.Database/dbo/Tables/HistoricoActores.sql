CREATE TABLE [dbo].[HistoricoActores]
(
	[Id] INT            IDENTITY (1, 1) NOT NULL,
	[Embarque_Id] INT NOT NULL,
	[Fecha] DATETIME NULL,
    [Usuario] NVARCHAR(50) NULL, 
	[Accion] NVARCHAR(50) NULL,
	CONSTRAINT [FK_dbo.HistoricoActores_dbo.Embarque_Embarque_Id] FOREIGN KEY ([Embarque_Id]) REFERENCES [dbo].[Embarque] ([Id]),
)
