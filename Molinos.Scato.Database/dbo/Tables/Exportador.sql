CREATE TABLE [dbo].[Exportador] (
    [Id]     INT            IDENTITY (1, 1) NOT NULL,
    [Nombre] NVARCHAR (60) NULL,    
    [Almacen_Id] INT NULL, 
    [Habilitado] BIT NOT NULL DEFAULT 1, 
    [Cuit] VARCHAR(50) NULL, 
    [CodigoSap] VARCHAR(50) NULL, 
    CONSTRAINT [PK_dbo.Exportador] PRIMARY KEY CLUSTERED ([Id] ASC),
	CONSTRAINT [UK_Exportador_Nombre] UNIQUE (Nombre),
	CONSTRAINT [FK_dbo.Exportador_dbo.Almacen_Almacen_Id] FOREIGN KEY ([Almacen_Id]) REFERENCES [dbo].[Almacen] ([Id])
);
GO