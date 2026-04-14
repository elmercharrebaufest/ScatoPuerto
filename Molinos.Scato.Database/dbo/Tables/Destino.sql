CREATE TABLE [dbo].[Destino] (
    [Id]     INT            IDENTITY (1, 1) NOT NULL,
    [Nombre] NVARCHAR (60) NULL,
    [Activo] BIT NOT NULL DEFAULT 1, 
    [IdSap] VARCHAR(50) NULL, 
    [Nacionalidad] VARCHAR(150) NULL, 
    [IdBandera] INT NULL, 
    CONSTRAINT [PK_dbo.Destino] PRIMARY KEY CLUSTERED ([Id] ASC),
	CONSTRAINT [UK_Destino_Nombre] UNIQUE (Nombre),
    CONSTRAINT [FK_Destino_Bandera] FOREIGN KEY ([IdBandera]) REFERENCES [dbo].[Bandera] ([Id])
);
GO