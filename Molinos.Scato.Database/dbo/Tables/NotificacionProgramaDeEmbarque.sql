CREATE TABLE [dbo].[NotificacionProgramaDeEmbarque] (
    [Id]        INT            IDENTITY (1, 1) NOT NULL,
	[TipoAlerta]   INT              NULL,
    [Mensaje]   NVARCHAR (1000) NULL,
    [Fecha]      DATETIME NULL,
    CONSTRAINT [PK_dbo.NotificacionProgramaDeEmbarque] PRIMARY KEY CLUSTERED ([Id] ASC),
);

