create table Senasa(
  Id                      int IDENTITY (1, 1) NOT NULL,
  NominacionDetalleIntervencion_Id int NOT NULL,
  Exportador_Id           int NOT NULL,
  TieneSenasa             bit NOT NULL,
  Consumo                 varchar(20) ,
  ACuentaDe               varchar(20) ,
  Destino_Id              int,
  IP                      BIT,
  GMO                     BIT,
  FITO                    BIT,
  MuestraOficial          BIT,
  CertificadoInocuidad    BIT,
  CertificadoVeterinario  BIT,
  Observaciones           varchar(500)
  CONSTRAINT [PK_dbo.Senasa] PRIMARY KEY CLUSTERED ([Id] ASC),
  CONSTRAINT [FK_dbo.Senasa_dbo.Senasa_NominacionDetalleIntervencion_Id] FOREIGN KEY ([NominacionDetalleIntervencion_Id]) REFERENCES [dbo].[NominacionDetalleIntervencion] ([Id]),
  CONSTRAINT [FK_dbo.Senasa_dbo.Senasa_Exportador_Id] FOREIGN KEY ([Exportador_Id]) REFERENCES [dbo].[Exportador] ([Id]),
  CONSTRAINT [FK_dbo.Senasa_dbo.Senasa_Destino_Id] FOREIGN KEY ([Destino_Id]) REFERENCES [dbo].[Destino] ([Id]),

)