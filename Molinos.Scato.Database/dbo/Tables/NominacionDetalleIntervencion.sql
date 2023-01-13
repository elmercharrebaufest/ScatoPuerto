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
CompaniaACuentaDe        varchar(100),
Observaciones            varchar(250),
TipoDeFumigacion_Id      int NULL,
CONSTRAINT [PK_dbo.NominacionDetalleIntervencion] PRIMARY KEY CLUSTERED ([Id] ASC),
CONSTRAINT [FK_dbo.NominacionDetalleIntervencion_dbo.NominacionDetalleIntervencion_CompaniaDeFumigacion_Id] FOREIGN KEY ([CompaniaDeFumigacion_Id]) REFERENCES [dbo].[CompaniaDeFumigacion] ([Id]),
CONSTRAINT [FK_dbo.NominacionDetalleIntervencion_dbo.NominacionDetalleIntervencion_TipoDeFumigacion_Id] FOREIGN KEY ([TipoDeFumigacion_Id]) REFERENCES [dbo].[TipoDeFumigacion] ([Id]),

)


GO

CREATE TRIGGER [dbo].[Trigger_NominacionDetalleIntervencion]
    ON [dbo].[NominacionDetalleIntervencion]
    FOR  UPDATE
    AS
    BEGIN
        IF((select CompaniaACuentaDe from deleted) <> (select CompaniaACuentaDe from inserted) )
        BEGIN
        insert into Auditoria
        SELECT 'NominacionDetalleIntervencion', 'CompaniaACuentaDe', d.CompaniaACuentaDe,
	        i.CompaniaACuentaDe , GETDATE()
             FROM deleted AS d
             JOIN inserted AS i
             ON d.Id=i.Id

        END
    END