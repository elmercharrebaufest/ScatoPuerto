CREATE TABLE [dbo].[CoordinadorPuerto] (
    [Id]     INT            IDENTITY (1, 1) NOT NULL,
    [Nombre] NVARCHAR (60) NOT NULL,    
    [Habilitado] BIT NOT NULL DEFAULT 1, 
    [CodigoSap] VARCHAR(50) NULL, 
    CONSTRAINT [PK_dbo.CoordinadorPuerto] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [UK_CoordinadorPuerto_Nombre] UNIQUE (Nombre)
);
GO