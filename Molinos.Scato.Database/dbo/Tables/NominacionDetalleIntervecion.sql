create table NominacionDetalleIntervecion(
Id                       int not null,
Nominacion_Id            int not null,
Precintado               smallint,
DraftSurvey              smallint,
ACuentaDe                varchar(100),
PermisoDeEmbarque        varchar(20),
EstibadorYTrimado        varchar(20),
Fumigacion               varchar(20),
CompaniaDeFumigacion_Id  int,
TipoDeFumigacion_Id      int,
CONSTRAINT [PK_dbo.NominacionDetalleIntervecion] PRIMARY KEY CLUSTERED ([Id] ASC),
CONSTRAINT [FK_dbo.NominacionDetalleIntervecion_dbo.NominacionDetalleIntervecion_Nominacion_Id] FOREIGN KEY ([Nominacion_Id]) REFERENCES [dbo].[Nominacion] ([Id]),
CONSTRAINT [FK_dbo.NominacionDetalleIntervecion_dbo.NominacionDetalleIntervecion_CompaniaDeFumigacion_Id] FOREIGN KEY ([CompaniaDeFumigacion_Id]) REFERENCES [dbo].[CompaniaDeFumigacion] ([Id]),
CONSTRAINT [FK_dbo.NominacionDetalleIntervecion_dbo.NominacionDetalleIntervecion_TipoDeFumigacion_Id] FOREIGN KEY ([TipoDeFumigacion_Id]) REFERENCES [dbo].[TipoDeFumigacion] ([Id]),

)

