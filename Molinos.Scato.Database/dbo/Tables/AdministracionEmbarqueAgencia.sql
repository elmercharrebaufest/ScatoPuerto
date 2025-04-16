CREATE TABLE [dbo].[AdministracionEmbarqueAgencia]
(
    [Id]  INT IDENTITY (1, 1) NOT NULL, 
    [AdministracionEmbarque_Id] INT NOT NULL, 
    [AgenciaMaritimaPuerto_Id] INT NOT NULL, 
    CONSTRAINT [FK_dbo.AdministracionEmbarqueAgencia_dbo.AdministracionEmbarque_AdministracionEmbarque_Id] FOREIGN KEY ([AdministracionEmbarque_Id]) REFERENCES [dbo].[AdministracionEmbarque] ([Id]),
    CONSTRAINT [FK_dbo.AdministracionEmbarqueAgencia_dbo.AgenciaMaritimaPuerto_AgenciaMaritimaPuerto_Id] FOREIGN KEY ([AgenciaMaritimaPuerto_Id]) REFERENCES [dbo].[AgenciaMaritimaPuerto] ([Id]),
)