create table NominacionDetalleIntervencion(
Id                       int IDENTITY (1, 1) NOT NULL,
Precintado               BIT,
PrecintadoACuentaDe      varchar(100),
DraftSurvey              BIT,
SurveyACuentaDe          varchar(100),
PermisoDeEmbarque        BIT,
EstibadorYTrimado        BIT,
Fumigacion               varchar(20),
CompaniaDeFumigacion_Id  int NULL,
ACuentaDe                varchar(100),
Observaciones            varchar(250),
TipoDeFumigacion_Id      int NULL,
CONSTRAINT [PK_dbo.NominacionDetalleIntervencion] PRIMARY KEY CLUSTERED ([Id] ASC),
CONSTRAINT [FK_dbo.NominacionDetalleIntervencion_dbo.NominacionDetalleIntervencion_CompaniaDeFumigacion_Id] FOREIGN KEY ([CompaniaDeFumigacion_Id]) REFERENCES [dbo].[CompaniaDeFumigacion] ([Id]),
CONSTRAINT [FK_dbo.NominacionDetalleIntervencion_dbo.NominacionDetalleIntervencion_TipoDeFumigacion_Id] FOREIGN KEY ([TipoDeFumigacion_Id]) REFERENCES [dbo].[TipoDeFumigacion] ([Id]),

)

