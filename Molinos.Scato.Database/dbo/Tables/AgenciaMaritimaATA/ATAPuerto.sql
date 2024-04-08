CREATE TABLE [dbo].[ATAPuerto] (
    [Id]     INT            IDENTITY (1, 1) NOT NULL,
    [Nombre] NVARCHAR (60) NOT NULL,    
    [Cuit] NVARCHAR(50) NULL, 
    [Activa] BIT NOT NULL DEFAULT 1, 
    CONSTRAINT [PK_dbo.ATAPuerto] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [UK_ATAPuerto_Nombre] UNIQUE (Nombre)
);
GO
