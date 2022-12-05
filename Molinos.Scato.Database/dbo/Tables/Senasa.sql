create table Senasa(
  Id                      int NOT NULL,
  NominacionDetalleIntervecion_Id int NOT NULL,
  Exportador_Id           int NOT NULL,
  TieneSenasa             smallint NOT NULL,
  Consumo                 varchar(20) ,
  ACuentaDe               varchar(20) ,
  Destino_Id              int,
  IP                      smallint,
  GMO                     smallint,
  FITO                    smallint,
  MuestraOficial          smallint,
  CertificadoInocuidad    smallint,
  CertificadoVeterinario  smallint,
  Observaciones           varchar(500)
  CONSTRAINT [PK_dbo.Senasa] PRIMARY KEY CLUSTERED ([Id] ASC),
  CONSTRAINT [FK_dbo.Senasa_dbo.Senasa_NominacionDetalleIntervecion_Id] FOREIGN KEY ([NominacionDetalleIntervecion_Id]) REFERENCES [dbo].[NominacionDetalleIntervecion] ([Id]),
  CONSTRAINT [FK_dbo.Senasa_dbo.Senasa_Exportador_Id] FOREIGN KEY ([Exportador_Id]) REFERENCES [dbo].[Exportador] ([Id]),
)