CREATE TABLE [dbo].[AgenciaMaritimaPuerto] (
    [Id]     INT            IDENTITY (1, 1) NOT NULL,
    [Nombre] NVARCHAR (60) NOT NULL,    
    [Cuit] NVARCHAR(50) NULL, 
    [Activa] BIT NOT NULL DEFAULT 1, 
    [IdAta] INT NULL, 
    [IdSap] VARCHAR(50) NULL, 
    CONSTRAINT [PK_dbo.AgenciaMaritimaPuerto] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [UK_AgenciaMaritimaPuerto_Nombre] UNIQUE (Nombre),
    CONSTRAINT [FK_AgenciaMaritimaPuerto_ATAPuerto] FOREIGN KEY ([IdAta]) REFERENCES [dbo].[ATAPuerto] ([Id])
);
GO