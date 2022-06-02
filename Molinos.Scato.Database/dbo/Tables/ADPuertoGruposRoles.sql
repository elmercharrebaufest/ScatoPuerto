CREATE TABLE [dbo].[ADPuertoGruposRoles] (
    [Id_Grupo] INT NOT NULL,
    [Id_Rol] INT NOT NULL,
    CONSTRAINT [PK_dbo.ADPuertoGruposRoles] PRIMARY KEY CLUSTERED ([Id_Grupo] ASC, [Id_Rol] ASC),
    CONSTRAINT [FK_dbo.ADPuertoGruposRoles_dbo.ADPuertoGruposAd_Id_Grupo] FOREIGN KEY ([Id_Grupo]) REFERENCES [dbo].[ADPuertoGruposAd] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_dbo.ADPuertoGruposRoles_dbo.ADPuertoRoles_Id_Rol] FOREIGN KEY ([Id_Rol]) REFERENCES [dbo].[ADPuertoRoles] ([Id]) ON DELETE CASCADE
);