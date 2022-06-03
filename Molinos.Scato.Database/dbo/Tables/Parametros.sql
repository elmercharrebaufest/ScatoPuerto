CREATE TABLE [dbo].[Parametros]
(
    [Id] INT NOT NULL,
    [Descripcion] NVARCHAR (50) NOT NULL,
    [Activo] bit NOT NULL default 0,
    PRIMARY KEY ([Id])
);