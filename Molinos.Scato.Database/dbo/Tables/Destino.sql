CREATE TABLE [dbo].[Destino] (
    [Id]     INT            IDENTITY (1, 1) NOT NULL,
    [Nombre] NVARCHAR (60) NULL,
    [Activo] BIT NOT NULL DEFAULT 1, 
    [CodigoSap] VARCHAR(50) NULL, 
    [Nacionalidad] VARCHAR(150) NULL, 
    [Bandera_Id] INT NULL, 
    CONSTRAINT [PK_dbo.Destino] PRIMARY KEY CLUSTERED ([Id] ASC),
	CONSTRAINT [UK_Destino_Nombre] UNIQUE (Nombre),
    CONSTRAINT [FK_dbo.Destino_dbo.Bandera_Bandera_Id] FOREIGN KEY ([Bandera_Id]) REFERENCES [dbo].[Bandera] ([Id])
);
GO