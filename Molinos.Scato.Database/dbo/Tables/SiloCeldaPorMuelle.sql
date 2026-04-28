CREATE TABLE [dbo].[SiloCeldaPorMuelle]
(
	[Id] INT NOT NULL PRIMARY KEY IDENTITY (1, 1), 
    [MuelleDeCarga_Id] INT NOT NULL, 
    [SiloCelda_Id] INT NOT NULL,
    CONSTRAINT [FK_dbo.SiloCeldaPorMuelle_dbo.MuelleDeCarga_MuelleDeCarga_Id] FOREIGN KEY ([MuelleDeCarga_Id]) REFERENCES [dbo].[MuelleDeCarga] ([Id]),
    CONSTRAINT [FK_dbo.SiloCeldaPorMuelle_dbo.SiloCelda_SiloCelda_Id] FOREIGN KEY ([SiloCelda_Id]) REFERENCES [dbo].[SiloCelda] ([Id])
)
