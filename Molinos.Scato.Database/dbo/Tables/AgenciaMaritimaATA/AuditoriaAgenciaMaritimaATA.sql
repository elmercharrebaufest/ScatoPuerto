CREATE TABLE [dbo].[AuditoriaAgenciaMaritimaATA]
(
	[Id] INT NOT NULL PRIMARY KEY IDENTITY(1, 1), 
    [Accion] INT NOT NULL,
    [ATAPuerto_Id] INT NULL, 
    [AgenciaMaritimaPuerto_Id] INT NULL, 
    [Nombre] NVARCHAR(200) NOT NULL, 
    [Cuit] NVARCHAR(110) NOT NULL, 
    [Activa] NVARCHAR(50) NOT NULL, 
    [Usuario] NVARCHAR(50) NULL, 
    [Fecha] DATETIME NOT NULL,
    CONSTRAINT [FK_dbo.AuditoriaAgenciaMaritimaATA_dbo.ATAPuerto_Id] FOREIGN KEY ([ATAPuerto_Id]) REFERENCES [ATAPuerto]([Id]) ,
    CONSTRAINT [FK_dbo.AuditoriaAgenciaMaritimaATA_dbo.AgenciaMaritimaPuerto_Id] FOREIGN KEY ([AgenciaMaritimaPuerto_Id]) REFERENCES [AgenciaMaritimaPuerto]([Id])
)
