CREATE TABLE [dbo].[Vapor] (
    [Id]     INT            IDENTITY (1, 1) NOT NULL,
    [Nombre] NVARCHAR (60) NULL,
    
    [Habilitado] BIT NOT NULL DEFAULT 1, 
    CONSTRAINT [PK_dbo.Vapor] PRIMARY KEY CLUSTERED ([Id] ASC),
	CONSTRAINT [UK_Vapor_Nombre] UNIQUE (Nombre) 
);
GO