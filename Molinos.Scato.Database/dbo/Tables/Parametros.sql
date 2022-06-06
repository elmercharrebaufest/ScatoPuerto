CREATE TABLE [dbo].[Parametros]
(
    [Id] INT NOT NULL,
    [Descripcion] NVARCHAR (50) NOT NULL,
    [Activo] bit NOT NULL default 0,
    [Parametro1] bit NOT NULL default 0,
    [Parametro2] int NOT NULL default 0,
    [Parametro3] NVARCHAR (100) NOT NULL default ''
    PRIMARY KEY ([Id])
);