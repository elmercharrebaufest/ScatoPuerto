CREATE TABLE [dbo].[ADPuertoRoles] (
    [Id] INT IDENTITY (1, 1) NOT NULL,
    [NombreRol] NVARCHAR (50) NOT NULL,
    CONSTRAINT [PK_dbo.ADPuertoRoles] PRIMARY KEY CLUSTERED ([Id] ASC),
);