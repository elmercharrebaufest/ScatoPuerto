CREATE TABLE [dbo].[MotivosFallasBalanza]
(
	[Id]        INT IDENTITY (1, 1) NOT NULL,
    [Nombre]	nvarchar(60) NOT NULL,
	[Siglas]	nvarchar(60) NOT NULL,
	[BajaCargaLiquido] BIT NULL DEFAULT 0 ,
	[BajaCargaSolido] BIT NULL DEFAULT 0 ,
	[CortesLiquido] BIT NULL DEFAULT 0 ,
	[CortesSolido] BIT NULL DEFAULT 0 ,
	--[Liquido]	bit  NOT NULL DEFAULT 0,
 --   [Corte] BIT NULL DEFAULT 0 , 
    CONSTRAINT [PK_dbo.MotivosFallasBalanza] PRIMARY KEY CLUSTERED ([Id] ASC),
);