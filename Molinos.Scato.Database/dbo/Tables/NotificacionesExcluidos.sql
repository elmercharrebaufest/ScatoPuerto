CREATE TABLE [dbo].[NotificacionExcluidos] (
    [Id]        INT            IDENTITY (1, 1) NOT NULL,
    [Username]	       nvarchar(50)  NOT NULL,
    [NotificacionProgramaDeEmbarque_id]            INT NOT NULL,
    CONSTRAINT [PK_dbo.NotificacionExcluidos] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_dbo.NotificacionExcluidos_dbo.Notificacion_id] FOREIGN KEY ([NotificacionProgramaDeEmbarque_id]) REFERENCES [dbo].[NotificacionProgramaDeEmbarque] ([Id]) ON DELETE CASCADE
);
