CREATE TABLE [dbo].[CamaraAduana] (
	[Id]       INT            IDENTITY (1, 1) NOT NULL,
	[Nombre]   NVARCHAR (100) NOT NULL,
	[Url]      NVARCHAR (200) NOT NULL,
	[Posicion] INT            NOT NULL,
	CONSTRAINT [PK_dbo.CamaraAduana] PRIMARY KEY CLUSTERED ([Id] ASC)
);
