CREATE TABLE [dbo].[CuposOtorgados] (
    [Id]          INT      IDENTITY (1, 1) NOT NULL,
    [Cupos]       INT      NULL,
    [Material_Id] INT      NULL,
    [Centro_Id]   INT      NOT NULL,
    [Fecha]       DATETIME NOT NULL,
    [Especial]    BIT      DEFAULT ((0)) NOT NULL,
    CONSTRAINT [FK_dbo.CuposOtorgados_dbo.Centro_Centro_Id] FOREIGN KEY ([Centro_Id]) REFERENCES [dbo].[Centro] ([Id]),
    CONSTRAINT [FK_dbo.CuposOtorgados_dbo.Material_Material_Id] FOREIGN KEY ([Material_Id]) REFERENCES [dbo].[Material] ([Id])
);
GO

