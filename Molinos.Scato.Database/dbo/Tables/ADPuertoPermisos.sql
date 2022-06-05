CREATE TABLE [dbo].[ADPuertoPermisos] (
    [Id] INT IDENTITY (1, 1) NOT NULL,
    [NombrePermiso] NVARCHAR (50) NOT NULL
    CONSTRAINT [PK_dbo.ADPuertoPermisos] PRIMARY KEY CLUSTERED ([Id] ASC),
);