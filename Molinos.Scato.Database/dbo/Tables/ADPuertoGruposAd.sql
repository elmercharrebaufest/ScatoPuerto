CREATE TABLE [dbo].[ADPuertoGruposAd] (
    [Id] INT IDENTITY (1, 1) NOT NULL,
    [NombreGrupoAD] NVARCHAR (50) NOT NULL
    CONSTRAINT [PK_dbo.ADPuertoGruposAd] PRIMARY KEY CLUSTERED ([Id] ASC),
);