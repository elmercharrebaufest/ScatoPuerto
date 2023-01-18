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

    declare @idNominacion INT;

    select  @idNominacion = (select n.id from NominacionDetalleIntervencion di 
    inner join Nominacion n on di.Id = n.NominacionDetalleIntervencion_Id
    where di.Id = deleted.id)


         IF((select Precintado from deleted) <> (select Precintado from inserted) )
        BEGIN
        insert into Auditoria
        SELECT @idNominacion , d.id, 'NominacionDetalleIntervencion', 'Precintado', d.Precintado,
	        i.Precintado , GETDATE()
             FROM deleted AS d
             JOIN inserted AS i
             ON d.Id=i.Id

        END
        ELSE IF((select PrecintadoACuentaDe from deleted) <> (select PrecintadoACuentaDe from inserted) )
        BEGIN
       insert into Auditoria
        SELECT @idNominacion , d.id, 'NominacionDetalleIntervencion', 'PrecintadoACuentaDe', d.PrecintadoACuentaDe,
	        i.PrecintadoACuentaDe , GETDATE()
             FROM deleted AS d
             JOIN inserted AS i
             ON d.Id=i.Id

        END
          ELSE IF((select DraftSurvey from deleted) <> (select DraftSurvey from inserted) )
        BEGIN
       insert into Auditoria
        SELECT @idNominacion , d.id, 'NominacionDetalleIntervencion', 'DraftSurvey', d.DraftSurvey,
	        i.DraftSurvey , GETDATE()
             FROM deleted AS d
             JOIN inserted AS i
             ON d.Id=i.Id

        END
          ELSE IF((select SurveyACuentaDe from deleted) <> (select SurveyACuentaDe from inserted) )
        BEGIN
       insert into Auditoria
        SELECT @idNominacion , d.id, 'NominacionDetalleIntervencion', 'SurveyACuentaDe', d.SurveyACuentaDe,
	        i.SurveyACuentaDe , GETDATE()
             FROM deleted AS d
             JOIN inserted AS i
             ON d.Id=i.Id

        END
          ELSE IF((select PermisoDeEmbarque from deleted) <> (select PermisoDeEmbarque from inserted) )
        BEGIN
       insert into Auditoria
        SELECT @idNominacion , d.id, 'NominacionDetalleIntervencion', 'PermisoDeEmbarque', d.PermisoDeEmbarque,
	        i.PermisoDeEmbarque , GETDATE()
             FROM deleted AS d
             JOIN inserted AS i
             ON d.Id=i.Id

        END
          ELSE IF((select EstibadorYTrimado from deleted) <> (select EstibadorYTrimado from inserted) )
        BEGIN
       insert into Auditoria
        SELECT @idNominacion , d.id, 'NominacionDetalleIntervencion', 'EstibadorYTrimado', d.EstibadorYTrimado,
	        i.EstibadorYTrimado , GETDATE()
             FROM deleted AS d
             JOIN inserted AS i
             ON d.Id=i.Id

        END
          ELSE IF((select Fumigacion from deleted) <> (select Fumigacion from inserted) )
        BEGIN
       insert into Auditoria
        SELECT @idNominacion , d.id, 'NominacionDetalleIntervencion', 'Fumigacion', d.Fumigacion,
	        i.Fumigacion , GETDATE()
             FROM deleted AS d
             JOIN inserted AS i
             ON d.Id=i.Id

        END
          ELSE IF((select CompaniaDeFumigacion_Id from deleted) <> (select CompaniaDeFumigacion_Id from inserted) )
        BEGIN
       insert into Auditoria
        SELECT @idNominacion , d.id, 'NominacionDetalleIntervencion', 'CompaniaDeFumigacion_Id', d.CompaniaDeFumigacion_Id,
	        i.CompaniaDeFumigacion_Id , GETDATE()
             FROM deleted AS d
             JOIN inserted AS i
             ON d.Id=i.Id

        END
          ELSE IF((select CompaniaACuentaDe from deleted) <> (select CompaniaACuentaDe from inserted) )
        BEGIN
       insert into Auditoria
        SELECT @idNominacion , d.id, 'NominacionDetalleIntervencion', 'CompaniaACuentaDe', d.CompaniaACuentaDe,
	        i.CompaniaACuentaDe , GETDATE()
             FROM deleted AS d
             JOIN inserted AS i
             ON d.Id=i.Id

        END
          ELSE IF((select Observaciones from deleted) <> (select Observaciones from inserted) )
        BEGIN
       insert into Auditoria
        SELECT @idNominacion , d.id, 'NominacionDetalleIntervencion', 'Observaciones', d.Observaciones,
	        i.Observaciones , GETDATE()
             FROM deleted AS d
             JOIN inserted AS i
             ON d.Id=i.Id

        END
          ELSE IF((select TipoDeFumigacion_Id from deleted) <> (select TipoDeFumigacion_Id from inserted) )
        BEGIN
       insert into Auditoria
        SELECT @idNominacion , d.id, 'NominacionDetalleIntervencion', 'TipoDeFumigacion_Id', d.TipoDeFumigacion_Id,
	        i.TipoDeFumigacion_Id , GETDATE()
             FROM deleted AS d
             JOIN inserted AS i
             ON d.Id=i.Id

        END

    END