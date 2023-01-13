CREATE TABLE [dbo].[Notificacion] (
    [Id]        INT            IDENTITY (1, 1) NOT NULL,
	[Grupo]   NVARCHAR (50) NULL,
	[TipoAlerta]   INT              NOT NULL,
    [Mensaje]   NVARCHAR (1000) NULL,
    [Hora]      DATETIME NULL,
    [Leido]     BIT           NOT NULL,
    [PuestoId]   INT              NULL,
    CONSTRAINT [PK_dbo.Notificacion] PRIMARY KEY CLUSTERED ([Id] ASC),
);

