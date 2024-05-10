CREATE TABLE [dbo].[AgenciaMaritimaPuerto] (
    [Id]     INT            IDENTITY (1, 1) NOT NULL,
    [Nombre] NVARCHAR (60) NOT NULL,    
    [Cuit] NVARCHAR(50) NULL, 
    [Activa] BIT NOT NULL DEFAULT 1, 
    CONSTRAINT [PK_dbo.AgenciaMaritimaPuerto] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [UK_AgenciaMaritimaPuerto_Nombre] UNIQUE (Nombre)
);
GO