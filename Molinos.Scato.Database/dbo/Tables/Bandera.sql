CREATE TABLE [dbo].[Bandera]
(
	[Id]          INT            IDENTITY (1, 1) NOT NULL,
    [Abreviatura] varchar (4) NOT NULL,
    [Nombre] varchar (50) NOT NULL,
    CONSTRAINT [PK_dbo.Bandera] PRIMARY KEY CLUSTERED ([Id] ASC)
)
