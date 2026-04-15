CREATE TABLE [dbo].[AgenciaMaritimaPuerto] (
    [Id]     INT            IDENTITY (1, 1) NOT NULL,
    [Nombre] NVARCHAR (60) NOT NULL,    
    [Cuit] NVARCHAR(50) NULL, 
    [Activa] BIT NOT NULL DEFAULT 1, 
    [Ata_Id] INT NULL, 
    [CodigoSap] VARCHAR(50) NULL, 
    CONSTRAINT [PK_dbo.AgenciaMaritimaPuerto] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [UK_AgenciaMaritimaPuerto_Nombre] UNIQUE (Nombre),
    CONSTRAINT [FK_dbo.AgenciaMaritimaPuerto_dbo.ATAPuerto_Ata_Id] FOREIGN KEY ([Ata_Id]) REFERENCES [dbo].[ATAPuerto] ([Id])
);
GO