CREATE TABLE [dbo].[NotificacionAdministracion] (
    [Id]        INT            IDENTITY (1, 1) NOT NULL,
    [Mensaje]   NVARCHAR (1000) NOT NULL,
    [Fecha]      DATETIME NOT NULL,
    [FechaEliminacion] DATETIME NULL, 
    [UsuarioEliminacion] NVARCHAR(50) NULL, 
    CONSTRAINT [PK_dbo.NotificacionAdministracion] PRIMARY KEY CLUSTERED ([Id] ASC),
);
