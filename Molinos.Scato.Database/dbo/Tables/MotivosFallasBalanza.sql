CREATE TABLE [dbo].[MotivosFallasBalanza]
(
	[Id]        INT IDENTITY (1, 1) NOT NULL,
    [Nombre]	nvarchar(60) NOT NULL,
	[Siglas]	nvarchar(60) NOT NULL,
	[Liquido]	bit  NOT NULL DEFAULT 0,
    CONSTRAINT [PK_dbo.MotivosFallasBalanza] PRIMARY KEY CLUSTERED ([Id] ASC),
);