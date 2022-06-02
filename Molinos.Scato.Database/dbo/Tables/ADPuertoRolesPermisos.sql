CREATE TABLE [dbo].[ADPuertoRolesPermisos] (
    [Id_Rol] INT NOT NULL,
    [Id_Permiso] INT NOT NULL,
    CONSTRAINT [PK_dbo.ADPuertoRolesPermisos] PRIMARY KEY CLUSTERED ([Id_Rol] ASC, [Id_Permiso] ASC),
    CONSTRAINT [FK_dbo.ADPuertoRolesPermisos_dbo.ADPuertoRoles_Id_Rol] FOREIGN KEY ([Id_Rol]) REFERENCES [dbo].[ADPuertoRoles] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_dbo.ADPuertoRolesPermisos_dbo.ADPuertoPermisos_Id_Permiso] FOREIGN KEY ([Id_Permiso]) REFERENCES [dbo].[ADPuertoPermisos] ([Id]) ON DELETE CASCADE
);