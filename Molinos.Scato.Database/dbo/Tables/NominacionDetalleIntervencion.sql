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
FOR UPDATE 
AS 
BEGIN 
    DECLARE @idNominacion       INT, 
            @idEmbarque         INT, 
            @dateDiff           INT, 
            @nombreEmbarque     NVARCHAR(60), 
            @muelle             NVARCHAR(60), 
            @fumigadorPrevio    NVARCHAR(60), 
            @fumigadorNuevo     NVARCHAR(60), 
            @mensaje            NVARCHAR(200);

    --select  @idNominacion = (select n.id from NominacionDetalleIntervencion di 
    --inner join Nominacion n on di.Id = n.NominacionDetalleIntervencion_Id
    --where di.Id = (select id from deleted))

    SELECT	@idNominacion = NOM.id, 
			@idEmbarque = NOM.Embarque_Id, 
			@dateDiff = DATEDIFF(SECOND, NOM.FechaCreacion, GETDATE()) 
	FROM NominacionDetalleIntervencion NDI 
	INNER JOIN Nominacion NOM 
	ON NDI.Id = NOM.NominacionDetalleIntervencion_Id 
	WHERE NDI.Id = (SELECT id FROM deleted);

    IF((SELECT Precintado FROM deleted) <> (SELECT Precintado FROM inserted)) 
    BEGIN 
        INSERT INTO Auditoria 
        SELECT @idNominacion, d.id, 'NominacionDetalleIntervencion', 'Precintado', 
        d.Precintado, i.Precintado , GETDATE(), NULL, NULL 
        FROM deleted AS d 
        JOIN inserted AS i 
        ON d.Id = i.Id 
    END

    IF((SELECT PrecintadoACuentaDe FROM deleted) <> (SELECT PrecintadoACuentaDe FROM inserted)) 
    BEGIN 
        INSERT INTO Auditoria 
        SELECT @idNominacion, d.id, 'NominacionDetalleIntervencion', 'PrecintadoACuentaDe', 
        d.PrecintadoACuentaDe, i.PrecintadoACuentaDe , GETDATE(), NULL, NULL 
        FROM deleted AS d 
        JOIN inserted AS i 
        ON d.Id = i.Id 
    END

    IF((SELECT DraftSurvey FROM deleted) <> (SELECT DraftSurvey FROM inserted)) 
    BEGIN 
        INSERT INTO Auditoria 
        SELECT @idNominacion, d.id, 'NominacionDetalleIntervencion', 'DraftSurvey', 
        d.DraftSurvey, i.DraftSurvey , GETDATE(), NULL, NULL 
        FROM deleted AS d 
        JOIN inserted AS i 
        ON d.Id = i.Id 
    END

    IF((SELECT SurveyACuentaDe FROM deleted) <> (select SurveyACuentaDe FROM inserted)) 
    BEGIN
        INSERT INTO Auditoria 
        SELECT @idNominacion, d.id, 'NominacionDetalleIntervencion', 'SurveyACuentaDe', 
        d.SurveyACuentaDe, i.SurveyACuentaDe , GETDATE(), NULL, NULL 
        FROM deleted AS d 
        JOIN inserted AS i 
        ON d.Id = i.Id 
    END

    IF((SELECT PermisoDeEmbarque FROM deleted) <> (SELECT PermisoDeEmbarque FROM inserted))
    BEGIN
        INSERT INTO Auditoria 
        SELECT @idNominacion, d.id, 'NominacionDetalleIntervencion', 'PermisoDeEmbarque', 
        d.PermisoDeEmbarque, i.PermisoDeEmbarque , GETDATE(), NULL, NULL 
        FROM deleted AS d 
        JOIN inserted AS i 
        ON d.Id = i.Id 
    END

    IF((SELECT EstibadorYTrimado FROM deleted) <> (SELECT EstibadorYTrimado FROM inserted))
    BEGIN
        INSERT INTO Auditoria 
        SELECT @idNominacion, d.id, 'NominacionDetalleIntervencion', 'EstibadorYTrimado', 
        d.EstibadorYTrimado, i.EstibadorYTrimado , GETDATE(), NULL, NULL 
        FROM deleted AS d 
        JOIN inserted AS i 
        ON d.Id = i.Id 
    END

    IF((SELECT Fumigacion FROM deleted) <> (SELECT Fumigacion FROM inserted))
    BEGIN
        INSERT INTO Auditoria 
        SELECT @idNominacion, d.id, 'NominacionDetalleIntervencion', 'Fumigacion', 
        d.Fumigacion, i.Fumigacion , GETDATE(), NULL, NULL
        FROM deleted AS d
        JOIN inserted AS i
         ON d.Id = i.Id
    END

    IF((SELECT CompaniaDeFumigacion_Id FROM deleted) <> (SELECT CompaniaDeFumigacion_Id FROM inserted))
    BEGIN
        INSERT INTO Auditoria 
        SELECT @idNominacion, d.id, 'NominacionDetalleIntervencion', 'CompaniaDeFumigacion_Id', 
        d.CompaniaDeFumigacion_Id, i.CompaniaDeFumigacion_Id , GETDATE(), NULL, NULL 
        FROM deleted AS d 
        JOIN inserted AS i 
        ON d.Id = i.Id 
    END

    IF((SELECT CompaniaACuentaDe FROM deleted) <> (SELECT CompaniaACuentaDe FROM inserted))
    BEGIN
        INSERT INTO Auditoria 
        SELECT @idNominacion, d.id, 'NominacionDetalleIntervencion', 'CompaniaACuentaDe', 
        d.CompaniaACuentaDe, i.CompaniaACuentaDe , GETDATE(), NULL, NULL 
        FROM deleted AS d 
        JOIN inserted AS i 
        ON d.Id = i.Id 
    END

    IF((SELECT Observaciones FROM deleted) <> (SELECT Observaciones FROM inserted))
    BEGIN
        INSERT INTO Auditoria 
        SELECT @idNominacion , d.id, 'NominacionDetalleIntervencion', 'Observaciones', 
        d.Observaciones, i.Observaciones , GETDATE(), NULL, NULL 
        FROM deleted AS d 
        JOIN inserted AS i 
        ON d.Id = i.Id 
    END
    
    IF((SELECT TipoDeFumigacion_Id FROM deleted) <> (SELECT TipoDeFumigacion_Id FROM inserted))
    BEGIN
        INSERT INTO Auditoria 
        SELECT @idNominacion , d.id, 'NominacionDetalleIntervencion', 'TipoDeFumigacion_Id', 
        d.TipoDeFumigacion_Id, i.TipoDeFumigacion_Id , GETDATE(), NULL, NULL 
        FROM deleted AS d 
        JOIN inserted AS i 
        ON d.Id = i.Id 
    END


    IF (@idEmbarque > 0) BEGIN 
        SELECT @nombreEmbarque = Patente, 
        @muelle = CASE WHEN Vicentin = 'true' THEN 'Vicentin' 
                    WHEN Noryon = 'true' THEN 'Noryon' 
                    WHEN SanBenito = 'true' THEN 'San Benito' 
                    ELSE 'Otros muelles' END 
        FROM Embarque 
        WHERE Id = @idEmbarque 
    END 

    SELECT @fumigadorPrevio = CDF.Descripcion 
    FROM deleted DEL 
    INNER JOIN CompaniaDeFumigacion CDF 
    ON CDF.Id = DEL.CompaniaDeFumigacion_Id 

    SELECT @fumigadorNuevo = CDF.Descripcion 
    FROM inserted INS 
    INNER JOIN CompaniaDeFumigacion CDF 
    ON CDF.Id = INS.CompaniaDeFumigacion_Id 

    IF((SELECT Fumigacion FROM deleted) <> (SELECT Fumigacion FROM inserted))
    BEGIN

        SELECT @mensaje = CONCAT('Se ha editado el embarque ', @nombreEmbarque, ' - ', @muelle, 'Fumigacion: ', 
                            CASE d.Fumigacion WHEN 'Si' THEN ' (SI' ELSE @fumigadorNuevo + ' (NO' END, 
                            --CASE d.Fumigacion WHEN 'Si' THEN ' (SI' ELSE ' (NO' END, 
                            ' -> ', 
                            CASE i.Fumigacion WHEN 'Si' THEN 'SI)' ELSE 'NO)' END)
        FROM deleted AS d 
        JOIN inserted AS i 
        ON d.Id = i.Id

        INSERT INTO NotificacionProgramaDeEmbarque (TipoAlerta, Mensaje, Fecha)
		SELECT 9, @mensaje, GETDATE()
    END 
END 
