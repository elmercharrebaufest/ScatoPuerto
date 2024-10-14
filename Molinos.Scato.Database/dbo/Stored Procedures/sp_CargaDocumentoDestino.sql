CREATE PROCEDURE [dbo].[sp_CargaDocumentoDestino]   
AS 
SET NOCOUNT ON 
declare @tbl_documentos table( 
	Id int,
	Documento varchar(500),
	Documento_Id int
)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(1,'Aflatoxin cert',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(2,'B/L',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(3,'Cargo Manifest',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(4,'Conformity certificate',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(5,'Declaration Statement from shipper',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(6,'Draft Survey',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(7,'Export Certificate for Plant Processed Products ',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(8,'Export declaration',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(9,'Free Sale ',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(10,'Fumigation',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(11,'GMO certificate (surveyor) ',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(12,'GMO Official',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(13,'GMP +',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(14,'Health',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(15,'Hold Cleanliness',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(16,'Hold Inspection',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(17,'Hold Sealing',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(18,'Human Consumption',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(19,'ISCC EU',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(20,'ISCC EU cert',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(21,'Isotopic analysis cert',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(22,'Labelling statement from shipper',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(23,'M/R',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(24,'Melamine Free Certificate',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(25,'MSDS',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(26,'Non Radiation cert',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(27,'Origin',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(28,'OrigIn SACU',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(29,'Packing List',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(30,'Phyto',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(31,'PNF',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(32,'PoS',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(33,'Producer declaration',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(34,'Quality',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(35,'Quality / Condition',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(36,'Quantity',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(37,'Readiness',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(38,'Safety certificate ',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(39,'Sanitary',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(40,'Sanitary certificate including Annex note ',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(41,'Tank Cleanliness',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(42,'Veterinary',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(43,'Weight ',0)

      update doc_temp
         set doc_temp.Documento_Id = doc.Id 
        from @tbl_documentos doc_temp 
  inner join Documento doc on doc.Nombre = doc_temp.Documento

declare @tbl_destinos_temp table( 
	Id int,
	Destino varchar(500),
	Destino_Id int
)
insert into @tbl_destinos_temp(Id, Destino, Destino_Id)values(1,'Arabia Saudita',0)
insert into @tbl_destinos_temp(Id, Destino, Destino_Id)values(2,'Alemania',0)
insert into @tbl_destinos_temp(Id, Destino, Destino_Id)values(3,'Argelia',0)
insert into @tbl_destinos_temp(Id, Destino, Destino_Id)values(4,'Belgica',0)
insert into @tbl_destinos_temp(Id, Destino, Destino_Id)values(5,'Bielorrusia',0)
insert into @tbl_destinos_temp(Id, Destino, Destino_Id)values(6,'Brunei',0)
insert into @tbl_destinos_temp(Id, Destino, Destino_Id)values(7,'Camerun',0)
insert into @tbl_destinos_temp(Id, Destino, Destino_Id)values(8,'Chile',0)
insert into @tbl_destinos_temp(Id, Destino, Destino_Id)values(9,'Congo',0)
insert into @tbl_destinos_temp(Id, Destino, Destino_Id)values(10,'Costa de Marfil',0)
insert into @tbl_destinos_temp(Id, Destino, Destino_Id)values(11,'Egipto',0)
insert into @tbl_destinos_temp(Id, Destino, Destino_Id)values(12,'España',0)
insert into @tbl_destinos_temp(Id, Destino, Destino_Id)values(13,'Filipinas',0)
insert into @tbl_destinos_temp(Id, Destino, Destino_Id)values(14,'Ghana',0)
insert into @tbl_destinos_temp(Id, Destino, Destino_Id)values(15,'Grecia',0)
insert into @tbl_destinos_temp(Id, Destino, Destino_Id)values(16,'Indonesia',0)
insert into @tbl_destinos_temp(Id, Destino, Destino_Id)values(17,'Italia',0)
insert into @tbl_destinos_temp(Id, Destino, Destino_Id)values(18,'Jordania',0)
insert into @tbl_destinos_temp(Id, Destino, Destino_Id)values(19,'Letonia',0)
insert into @tbl_destinos_temp(Id, Destino, Destino_Id)values(20,'Libano ',0)
insert into @tbl_destinos_temp(Id, Destino, Destino_Id)values(21,'Lituania ',0)
insert into @tbl_destinos_temp(Id, Destino, Destino_Id)values(22,'Malasia',0)
insert into @tbl_destinos_temp(Id, Destino, Destino_Id)values(23,'Marruecos',0)
insert into @tbl_destinos_temp(Id, Destino, Destino_Id)values(24,'Mauritius',0)
insert into @tbl_destinos_temp(Id, Destino, Destino_Id)values(25,'Oman',0)
insert into @tbl_destinos_temp(Id, Destino, Destino_Id)values(26,'Sudafrica',0)
insert into @tbl_destinos_temp(Id, Destino, Destino_Id)values(27,'Tailandia',0)
insert into @tbl_destinos_temp(Id, Destino, Destino_Id)values(28,'Tunez',0)
insert into @tbl_destinos_temp(Id, Destino, Destino_Id)values(29,'Turquia',0)
insert into @tbl_destinos_temp(Id, Destino, Destino_Id)values(30,'REINO UNIDO',0)
insert into @tbl_destinos_temp(Id, Destino, Destino_Id)values(31,'Vietnam',0)
insert into @tbl_destinos_temp(Id, Destino, Destino_Id)values(32,'Yemen',0)
    update temp
	   set temp.Destino_Id = dest.Id 
      from @tbl_destinos_temp temp
inner join Destino dest on dest.Nombre = temp.Destino

declare @tbl_documentos_destino table( 
Id_Documento int,
Campo1  varchar(100),
Campo2  varchar(100),
Campo3  varchar(100),
Campo4  varchar(100),
Campo5  varchar(100),
Campo6  varchar(100),
Campo7  varchar(100),
Campo8  varchar(100),
Campo9  varchar(100),
Campo10 varchar(100),
Campo11 varchar(100),
Campo12 varchar(100),
Campo13 varchar(100),
Campo14 varchar(100),
Campo15 varchar(100),
Campo16 varchar(100),
Campo17 varchar(100),
Campo18 varchar(100),
Campo19 varchar(100),
Campo20 varchar(100),
Campo21 varchar(100),
Campo22 varchar(100),
Campo23 varchar(100),
Campo24 varchar(100),
Campo25 varchar(100),
Campo26 varchar(100),
Campo27 varchar(100),
Campo28 varchar(100),
Campo29 varchar(100),
Campo30 varchar(100),
Campo31 varchar(100),
Campo32 varchar(100)
)


insert into @tbl_documentos_destino(Id_Documento ,Campo1  ,Campo2  ,Campo3  ,Campo4  ,Campo5  ,Campo6  ,Campo7  ,Campo8  ,Campo9  ,Campo10 ,Campo11 ,Campo12 ,Campo13 ,Campo14 ,Campo15 ,Campo16 ,Campo17 ,Campo18 ,Campo19 ,Campo20 ,Campo21 ,Campo22 ,Campo23 ,Campo24 ,Campo25 ,Campo26 ,Campo27 ,Campo28 ,Campo29 ,Campo30 ,Campo31 ,Campo32 )values(1,' ','','','','','','','D8-1','','',' ','','','','','',' ',' ',' ',' ','','','','',' ','',' ','','','','','')
insert into @tbl_documentos_destino(Id_Documento ,Campo1  ,Campo2  ,Campo3  ,Campo4  ,Campo5  ,Campo6  ,Campo7  ,Campo8  ,Campo9  ,Campo10 ,Campo11 ,Campo12 ,Campo13 ,Campo14 ,Campo15 ,Campo16 ,Campo17 ,Campo18 ,Campo19 ,Campo20 ,Campo21 ,Campo22 ,Campo23 ,Campo24 ,Campo25 ,Campo26 ,Campo27 ,Campo28 ,Campo29 ,Campo30 ,Campo31 ,Campo32 )values(2,'D1-1','D2-1','D3-1','D4-1','D5-1','D6-1','D7-1','D8-1','D9-1','D10-1','','D12-1','D13-1','D14-1','D15-1','D16-1','D17-1','D18-1','D19-1','','D21-1','D22-1','D23-1','D24-1','D25-1','D26-1','D27-1','D28-1','D29-1','D30-1','D31-1','D32-1')
insert into @tbl_documentos_destino(Id_Documento ,Campo1  ,Campo2  ,Campo3  ,Campo4  ,Campo5  ,Campo6  ,Campo7  ,Campo8  ,Campo9  ,Campo10 ,Campo11 ,Campo12 ,Campo13 ,Campo14 ,Campo15 ,Campo16 ,Campo17 ,Campo18 ,Campo19 ,Campo20 ,Campo21 ,Campo22 ,Campo23 ,Campo24 ,Campo25 ,Campo26 ,Campo27 ,Campo28 ,Campo29 ,Campo30 ,Campo31 ,Campo32 )values(3,'','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','')
insert into @tbl_documentos_destino(Id_Documento ,Campo1  ,Campo2  ,Campo3  ,Campo4  ,Campo5  ,Campo6  ,Campo7  ,Campo8  ,Campo9  ,Campo10 ,Campo11 ,Campo12 ,Campo13 ,Campo14 ,Campo15 ,Campo16 ,Campo17 ,Campo18 ,Campo19 ,Campo20 ,Campo21 ,Campo22 ,Campo23 ,Campo24 ,Campo25 ,Campo26 ,Campo27 ,Campo28 ,Campo29 ,Campo30 ,Campo31 ,Campo32 )values(4,'','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','')
insert into @tbl_documentos_destino(Id_Documento ,Campo1  ,Campo2  ,Campo3  ,Campo4  ,Campo5  ,Campo6  ,Campo7  ,Campo8  ,Campo9  ,Campo10 ,Campo11 ,Campo12 ,Campo13 ,Campo14 ,Campo15 ,Campo16 ,Campo17 ,Campo18 ,Campo19 ,Campo20 ,Campo21 ,Campo22 ,Campo23 ,Campo24 ,Campo25 ,Campo26 ,Campo27 ,Campo28 ,Campo29 ,Campo30 ,Campo31 ,Campo32 )values(5,'','','','','','','','','','','','','','','','','','','','','','D22-1','','','','','','','','','','')
insert into @tbl_documentos_destino(Id_Documento ,Campo1  ,Campo2  ,Campo3  ,Campo4  ,Campo5  ,Campo6  ,Campo7  ,Campo8  ,Campo9  ,Campo10 ,Campo11 ,Campo12 ,Campo13 ,Campo14 ,Campo15 ,Campo16 ,Campo17 ,Campo18 ,Campo19 ,Campo20 ,Campo21 ,Campo22 ,Campo23 ,Campo24 ,Campo25 ,Campo26 ,Campo27 ,Campo28 ,Campo29 ,Campo30 ,Campo31 ,Campo32 )values(6,'','','','','','D6-1','','','','','','','','','','','','','','','','D22-1','','','','','','','','','','')
insert into @tbl_documentos_destino(Id_Documento ,Campo1  ,Campo2  ,Campo3  ,Campo4  ,Campo5  ,Campo6  ,Campo7  ,Campo8  ,Campo9  ,Campo10 ,Campo11 ,Campo12 ,Campo13 ,Campo14 ,Campo15 ,Campo16 ,Campo17 ,Campo18 ,Campo19 ,Campo20 ,Campo21 ,Campo22 ,Campo23 ,Campo24 ,Campo25 ,Campo26 ,Campo27 ,Campo28 ,Campo29 ,Campo30 ,Campo31 ,Campo32 )values(7,'','','','','','','','','','','','','','','','','','','','','D21-1','','','','','','','','','','','')
insert into @tbl_documentos_destino(Id_Documento ,Campo1  ,Campo2  ,Campo3  ,Campo4  ,Campo5  ,Campo6  ,Campo7  ,Campo8  ,Campo9  ,Campo10 ,Campo11 ,Campo12 ,Campo13 ,Campo14 ,Campo15 ,Campo16 ,Campo17 ,Campo18 ,Campo19 ,Campo20 ,Campo21 ,Campo22 ,Campo23 ,Campo24 ,Campo25 ,Campo26 ,Campo27 ,Campo28 ,Campo29 ,Campo30 ,Campo31 ,Campo32 )values(8,'','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','')
insert into @tbl_documentos_destino(Id_Documento ,Campo1  ,Campo2  ,Campo3  ,Campo4  ,Campo5  ,Campo6  ,Campo7  ,Campo8  ,Campo9  ,Campo10 ,Campo11 ,Campo12 ,Campo13 ,Campo14 ,Campo15 ,Campo16 ,Campo17 ,Campo18 ,Campo19 ,Campo20 ,Campo21 ,Campo22 ,Campo23 ,Campo24 ,Campo25 ,Campo26 ,Campo27 ,Campo28 ,Campo29 ,Campo30 ,Campo31 ,Campo32 )values(9,'','','D3-1','','','','','','','','','','','','','','','','','','','','','','','','','','','','','')
insert into @tbl_documentos_destino(Id_Documento ,Campo1  ,Campo2  ,Campo3  ,Campo4  ,Campo5  ,Campo6  ,Campo7  ,Campo8  ,Campo9  ,Campo10 ,Campo11 ,Campo12 ,Campo13 ,Campo14 ,Campo15 ,Campo16 ,Campo17 ,Campo18 ,Campo19 ,Campo20 ,Campo21 ,Campo22 ,Campo23 ,Campo24 ,Campo25 ,Campo26 ,Campo27 ,Campo28 ,Campo29 ,Campo30 ,Campo31 ,Campo32 )values(10,'D1-1','','D3-1','','D5-1','','D7-1','D8-1','D9-1','D10-1','D11-1','','D13-1','D14-1','','D16-1','D17-1','D18-1','','D20-1','D21-1','','','D24-1','D25-1','D26-1','D27-1','','D29-1','','D31-1','D32-1')
insert into @tbl_documentos_destino(Id_Documento ,Campo1  ,Campo2  ,Campo3  ,Campo4  ,Campo5  ,Campo6  ,Campo7  ,Campo8  ,Campo9  ,Campo10 ,Campo11 ,Campo12 ,Campo13 ,Campo14 ,Campo15 ,Campo16 ,Campo17 ,Campo18 ,Campo19 ,Campo20 ,Campo21 ,Campo22 ,Campo23 ,Campo24 ,Campo25 ,Campo26 ,Campo27 ,Campo28 ,Campo29 ,Campo30 ,Campo31 ,Campo32 )values(11,'','','','','','','','','','','','','','','','','','','','','','','','D24-1','','','','','','','','')
insert into @tbl_documentos_destino(Id_Documento ,Campo1  ,Campo2  ,Campo3  ,Campo4  ,Campo5  ,Campo6  ,Campo7  ,Campo8  ,Campo9  ,Campo10 ,Campo11 ,Campo12 ,Campo13 ,Campo14 ,Campo15 ,Campo16 ,Campo17 ,Campo18 ,Campo19 ,Campo20 ,Campo21 ,Campo22 ,Campo23 ,Campo24 ,Campo25 ,Campo26 ,Campo27 ,Campo28 ,Campo29 ,Campo30 ,Campo31 ,Campo32 )values(12,'','','','','','','','','','','','D12-1','D13-1','','','','','','D19-1','D20-1','','','','D24-1','','','','','','','','')
insert into @tbl_documentos_destino(Id_Documento ,Campo1  ,Campo2  ,Campo3  ,Campo4  ,Campo5  ,Campo6  ,Campo7  ,Campo8  ,Campo9  ,Campo10 ,Campo11 ,Campo12 ,Campo13 ,Campo14 ,Campo15 ,Campo16 ,Campo17 ,Campo18 ,Campo19 ,Campo20 ,Campo21 ,Campo22 ,Campo23 ,Campo24 ,Campo25 ,Campo26 ,Campo27 ,Campo28 ,Campo29 ,Campo30 ,Campo31 ,Campo32 )values(13,'','','','','','','','','','','','','D13-1','','','','D17-1','','','','','','','','','','D27-1','','','','','')
insert into @tbl_documentos_destino(Id_Documento ,Campo1  ,Campo2  ,Campo3  ,Campo4  ,Campo5  ,Campo6  ,Campo7  ,Campo8  ,Campo9  ,Campo10 ,Campo11 ,Campo12 ,Campo13 ,Campo14 ,Campo15 ,Campo16 ,Campo17 ,Campo18 ,Campo19 ,Campo20 ,Campo21 ,Campo22 ,Campo23 ,Campo24 ,Campo25 ,Campo26 ,Campo27 ,Campo28 ,Campo29 ,Campo30 ,Campo31 ,Campo32 )values(14,'','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','')
insert into @tbl_documentos_destino(Id_Documento ,Campo1  ,Campo2  ,Campo3  ,Campo4  ,Campo5  ,Campo6  ,Campo7  ,Campo8  ,Campo9  ,Campo10 ,Campo11 ,Campo12 ,Campo13 ,Campo14 ,Campo15 ,Campo16 ,Campo17 ,Campo18 ,Campo19 ,Campo20 ,Campo21 ,Campo22 ,Campo23 ,Campo24 ,Campo25 ,Campo26 ,Campo27 ,Campo28 ,Campo29 ,Campo30 ,Campo31 ,Campo32 )values(15,'','','D3-1','','','D6-1','','','D9-1','','','','','','','','','','','','','D22-1','','D24-1','','D26-1','','','D29-1','D30-1','','D32-1')
insert into @tbl_documentos_destino(Id_Documento ,Campo1  ,Campo2  ,Campo3  ,Campo4  ,Campo5  ,Campo6  ,Campo7  ,Campo8  ,Campo9  ,Campo10 ,Campo11 ,Campo12 ,Campo13 ,Campo14 ,Campo15 ,Campo16 ,Campo17 ,Campo18 ,Campo19 ,Campo20 ,Campo21 ,Campo22 ,Campo23 ,Campo24 ,Campo25 ,Campo26 ,Campo27 ,Campo28 ,Campo29 ,Campo30 ,Campo31 ,Campo32 )values(16,'','','','','D5-1','','','','','','','','','D14-1','','','','','','','D21-1','','','','','','','','','','D31-1','')
insert into @tbl_documentos_destino(Id_Documento ,Campo1  ,Campo2  ,Campo3  ,Campo4  ,Campo5  ,Campo6  ,Campo7  ,Campo8  ,Campo9  ,Campo10 ,Campo11 ,Campo12 ,Campo13 ,Campo14 ,Campo15 ,Campo16 ,Campo17 ,Campo18 ,Campo19 ,Campo20 ,Campo21 ,Campo22 ,Campo23 ,Campo24 ,Campo25 ,Campo26 ,Campo27 ,Campo28 ,Campo29 ,Campo30 ,Campo31 ,Campo32 )values(17,'','','','','','','','','','','','','D13-1','','D15-1','D16-1','','','','','','D22-1','','','','','D27-1','D28-1','','','','')
insert into @tbl_documentos_destino(Id_Documento ,Campo1  ,Campo2  ,Campo3  ,Campo4  ,Campo5  ,Campo6  ,Campo7  ,Campo8  ,Campo9  ,Campo10 ,Campo11 ,Campo12 ,Campo13 ,Campo14 ,Campo15 ,Campo16 ,Campo17 ,Campo18 ,Campo19 ,Campo20 ,Campo21 ,Campo22 ,Campo23 ,Campo24 ,Campo25 ,Campo26 ,Campo27 ,Campo28 ,Campo29 ,Campo30 ,Campo31 ,Campo32 )values(18,'','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','')
insert into @tbl_documentos_destino(Id_Documento ,Campo1  ,Campo2  ,Campo3  ,Campo4  ,Campo5  ,Campo6  ,Campo7  ,Campo8  ,Campo9  ,Campo10 ,Campo11 ,Campo12 ,Campo13 ,Campo14 ,Campo15 ,Campo16 ,Campo17 ,Campo18 ,Campo19 ,Campo20 ,Campo21 ,Campo22 ,Campo23 ,Campo24 ,Campo25 ,Campo26 ,Campo27 ,Campo28 ,Campo29 ,Campo30 ,Campo31 ,Campo32 )values(21,'','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','')
insert into @tbl_documentos_destino(Id_Documento ,Campo1  ,Campo2  ,Campo3  ,Campo4  ,Campo5  ,Campo6  ,Campo7  ,Campo8  ,Campo9  ,Campo10 ,Campo11 ,Campo12 ,Campo13 ,Campo14 ,Campo15 ,Campo16 ,Campo17 ,Campo18 ,Campo19 ,Campo20 ,Campo21 ,Campo22 ,Campo23 ,Campo24 ,Campo25 ,Campo26 ,Campo27 ,Campo28 ,Campo29 ,Campo30 ,Campo31 ,Campo32 )values(19,'','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','')
insert into @tbl_documentos_destino(Id_Documento ,Campo1  ,Campo2  ,Campo3  ,Campo4  ,Campo5  ,Campo6  ,Campo7  ,Campo8  ,Campo9  ,Campo10 ,Campo11 ,Campo12 ,Campo13 ,Campo14 ,Campo15 ,Campo16 ,Campo17 ,Campo18 ,Campo19 ,Campo20 ,Campo21 ,Campo22 ,Campo23 ,Campo24 ,Campo25 ,Campo26 ,Campo27 ,Campo28 ,Campo29 ,Campo30 ,Campo31 ,Campo32 )values(22,'','','','','','','','','','','','','','','','','','','','','','D22-1','','','','','','','','','','')
insert into @tbl_documentos_destino(Id_Documento ,Campo1  ,Campo2  ,Campo3  ,Campo4  ,Campo5  ,Campo6  ,Campo7  ,Campo8  ,Campo9  ,Campo10 ,Campo11 ,Campo12 ,Campo13 ,Campo14 ,Campo15 ,Campo16 ,Campo17 ,Campo18 ,Campo19 ,Campo20 ,Campo21 ,Campo22 ,Campo23 ,Campo24 ,Campo25 ,Campo26 ,Campo27 ,Campo28 ,Campo29 ,Campo30 ,Campo31 ,Campo32 )values(23,'','','','','','','','','','','D11-1','','','','','','','','','D20-1','','','','','','','','','','','D31-1','')
insert into @tbl_documentos_destino(Id_Documento ,Campo1  ,Campo2  ,Campo3  ,Campo4  ,Campo5  ,Campo6  ,Campo7  ,Campo8  ,Campo9  ,Campo10 ,Campo11 ,Campo12 ,Campo13 ,Campo14 ,Campo15 ,Campo16 ,Campo17 ,Campo18 ,Campo19 ,Campo20 ,Campo21 ,Campo22 ,Campo23 ,Campo24 ,Campo25 ,Campo26 ,Campo27 ,Campo28 ,Campo29 ,Campo30 ,Campo31 ,Campo32 )values(24,'','','','','','','','','','','','','D13-1','','','D16-1','','','','','','D22-1','','D24-1','','D26-1','D27-1','','','','D31-1','')
insert into @tbl_documentos_destino(Id_Documento ,Campo1  ,Campo2  ,Campo3  ,Campo4  ,Campo5  ,Campo6  ,Campo7  ,Campo8  ,Campo9  ,Campo10 ,Campo11 ,Campo12 ,Campo13 ,Campo14 ,Campo15 ,Campo16 ,Campo17 ,Campo18 ,Campo19 ,Campo20 ,Campo21 ,Campo22 ,Campo23 ,Campo24 ,Campo25 ,Campo26 ,Campo27 ,Campo28 ,Campo29 ,Campo30 ,Campo31 ,Campo32 )values(25,'','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','')
insert into @tbl_documentos_destino(Id_Documento ,Campo1  ,Campo2  ,Campo3  ,Campo4  ,Campo5  ,Campo6  ,Campo7  ,Campo8  ,Campo9  ,Campo10 ,Campo11 ,Campo12 ,Campo13 ,Campo14 ,Campo15 ,Campo16 ,Campo17 ,Campo18 ,Campo19 ,Campo20 ,Campo21 ,Campo22 ,Campo23 ,Campo24 ,Campo25 ,Campo26 ,Campo27 ,Campo28 ,Campo29 ,Campo30 ,Campo31 ,Campo32 )values(26,'','','','','','','','','','','','','','','','','','','','','','','','','','','','','D29-1','','','')
insert into @tbl_documentos_destino(Id_Documento ,Campo1  ,Campo2  ,Campo3  ,Campo4  ,Campo5  ,Campo6  ,Campo7  ,Campo8  ,Campo9  ,Campo10 ,Campo11 ,Campo12 ,Campo13 ,Campo14 ,Campo15 ,Campo16 ,Campo17 ,Campo18 ,Campo19 ,Campo20 ,Campo21 ,Campo22 ,Campo23 ,Campo24 ,Campo25 ,Campo26 ,Campo27 ,Campo28 ,Campo29 ,Campo30 ,Campo31 ,Campo32 )values(28,'','','','','','','','','','','','','','','','','','','','','','','','','','D26-1','','','','','','')
insert into @tbl_documentos_destino(Id_Documento ,Campo1  ,Campo2  ,Campo3  ,Campo4  ,Campo5  ,Campo6  ,Campo7  ,Campo8  ,Campo9  ,Campo10 ,Campo11 ,Campo12 ,Campo13 ,Campo14 ,Campo15 ,Campo16 ,Campo17 ,Campo18 ,Campo19 ,Campo20 ,Campo21 ,Campo22 ,Campo23 ,Campo24 ,Campo25 ,Campo26 ,Campo27 ,Campo28 ,Campo29 ,Campo30 ,Campo31 ,Campo32 )values(27,'D1-1','D2-1','D3-1','D4-1','D5-1','D6-1','D7-1','D8-1','D9-1','D10-1','D11-1','D12-1','D13-1','D14-1','D15-1','D16-1','D17-1','D18-1','D19-1','D20-1','D21-1','D22-1','D23-1','D24-1','D25-1','','D27-1','D28-1','D29-1','D30-1','D31-1','D32-1')
insert into @tbl_documentos_destino(Id_Documento ,Campo1  ,Campo2  ,Campo3  ,Campo4  ,Campo5  ,Campo6  ,Campo7  ,Campo8  ,Campo9  ,Campo10 ,Campo11 ,Campo12 ,Campo13 ,Campo14 ,Campo15 ,Campo16 ,Campo17 ,Campo18 ,Campo19 ,Campo20 ,Campo21 ,Campo22 ,Campo23 ,Campo24 ,Campo25 ,Campo26 ,Campo27 ,Campo28 ,Campo29 ,Campo30 ,Campo31 ,Campo32 )values(29,'','','','','','','D7-1','','D9-1','D10-1','','','','','','','','','','','','','','','','','','','','','','')
insert into @tbl_documentos_destino(Id_Documento ,Campo1  ,Campo2  ,Campo3  ,Campo4  ,Campo5  ,Campo6  ,Campo7  ,Campo8  ,Campo9  ,Campo10 ,Campo11 ,Campo12 ,Campo13 ,Campo14 ,Campo15 ,Campo16 ,Campo17 ,Campo18 ,Campo19 ,Campo20 ,Campo21 ,Campo22 ,Campo23 ,Campo24 ,Campo25 ,Campo26 ,Campo27 ,Campo28 ,Campo29 ,Campo30 ,Campo31 ,Campo32 )values(30,'D1-1','','D3-1','','D5-1','D6-1','D7-1','D8-1','D9-1','D10-1','D11-1','','D13-1','D14-1','D15-1','D16-1','D17-1','D18-1','D19-1','D20-1','','D22-1','D23-1','D24-1','D25-1','D26-1','D27-1','D28-1','D29-1','','D31-1','D32-1')
insert into @tbl_documentos_destino(Id_Documento ,Campo1  ,Campo2  ,Campo3  ,Campo4  ,Campo5  ,Campo6  ,Campo7  ,Campo8  ,Campo9  ,Campo10 ,Campo11 ,Campo12 ,Campo13 ,Campo14 ,Campo15 ,Campo16 ,Campo17 ,Campo18 ,Campo19 ,Campo20 ,Campo21 ,Campo22 ,Campo23 ,Campo24 ,Campo25 ,Campo26 ,Campo27 ,Campo28 ,Campo29 ,Campo30 ,Campo31 ,Campo32 )values(31,'','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','')
insert into @tbl_documentos_destino(Id_Documento ,Campo1  ,Campo2  ,Campo3  ,Campo4  ,Campo5  ,Campo6  ,Campo7  ,Campo8  ,Campo9  ,Campo10 ,Campo11 ,Campo12 ,Campo13 ,Campo14 ,Campo15 ,Campo16 ,Campo17 ,Campo18 ,Campo19 ,Campo20 ,Campo21 ,Campo22 ,Campo23 ,Campo24 ,Campo25 ,Campo26 ,Campo27 ,Campo28 ,Campo29 ,Campo30 ,Campo31 ,Campo32 )values(32,'','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','')
insert into @tbl_documentos_destino(Id_Documento ,Campo1  ,Campo2  ,Campo3  ,Campo4  ,Campo5  ,Campo6  ,Campo7  ,Campo8  ,Campo9  ,Campo10 ,Campo11 ,Campo12 ,Campo13 ,Campo14 ,Campo15 ,Campo16 ,Campo17 ,Campo18 ,Campo19 ,Campo20 ,Campo21 ,Campo22 ,Campo23 ,Campo24 ,Campo25 ,Campo26 ,Campo27 ,Campo28 ,Campo29 ,Campo30 ,Campo31 ,Campo32 )values(33,'','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','')
insert into @tbl_documentos_destino(Id_Documento ,Campo1  ,Campo2  ,Campo3  ,Campo4  ,Campo5  ,Campo6  ,Campo7  ,Campo8  ,Campo9  ,Campo10 ,Campo11 ,Campo12 ,Campo13 ,Campo14 ,Campo15 ,Campo16 ,Campo17 ,Campo18 ,Campo19 ,Campo20 ,Campo21 ,Campo22 ,Campo23 ,Campo24 ,Campo25 ,Campo26 ,Campo27 ,Campo28 ,Campo29 ,Campo30 ,Campo31 ,Campo32 )values(34,'D1-1','','D3-1','','D5-1','D6-1','D7-1','D8-1','D9-1','D10-1','D11-1','','D13-1','D14-1','D15-1','D16-1','D17-1','D18-1','D19-1','D20-1','D21-1','D22-1','D23-1','D24-1','D25-1','D26-1','','D28-1','D29-1','','D31-1','D32-1')
insert into @tbl_documentos_destino(Id_Documento ,Campo1  ,Campo2  ,Campo3  ,Campo4  ,Campo5  ,Campo6  ,Campo7  ,Campo8  ,Campo9  ,Campo10 ,Campo11 ,Campo12 ,Campo13 ,Campo14 ,Campo15 ,Campo16 ,Campo17 ,Campo18 ,Campo19 ,Campo20 ,Campo21 ,Campo22 ,Campo23 ,Campo24 ,Campo25 ,Campo26 ,Campo27 ,Campo28 ,Campo29 ,Campo30 ,Campo31 ,Campo32 )values(35,'','D2-1','','D4-1','','','','','','','','D12-1','','','','','','','','','','','','','','','D27-1','','','D30-1','','')
insert into @tbl_documentos_destino(Id_Documento ,Campo1  ,Campo2  ,Campo3  ,Campo4  ,Campo5  ,Campo6  ,Campo7  ,Campo8  ,Campo9  ,Campo10 ,Campo11 ,Campo12 ,Campo13 ,Campo14 ,Campo15 ,Campo16 ,Campo17 ,Campo18 ,Campo19 ,Campo20 ,Campo21 ,Campo22 ,Campo23 ,Campo24 ,Campo25 ,Campo26 ,Campo27 ,Campo28 ,Campo29 ,Campo30 ,Campo31 ,Campo32 )values(36,'','','','','','','','','','','','','','','','','D17-1','','','','','','','','','','','','','','','D32-1')
insert into @tbl_documentos_destino(Id_Documento ,Campo1  ,Campo2  ,Campo3  ,Campo4  ,Campo5  ,Campo6  ,Campo7  ,Campo8  ,Campo9  ,Campo10 ,Campo11 ,Campo12 ,Campo13 ,Campo14 ,Campo15 ,Campo16 ,Campo17 ,Campo18 ,Campo19 ,Campo20 ,Campo21 ,Campo22 ,Campo23 ,Campo24 ,Campo25 ,Campo26 ,Campo27 ,Campo28 ,Campo29 ,Campo30 ,Campo31 ,Campo32 )values(37,'','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','')
insert into @tbl_documentos_destino(Id_Documento ,Campo1  ,Campo2  ,Campo3  ,Campo4  ,Campo5  ,Campo6  ,Campo7  ,Campo8  ,Campo9  ,Campo10 ,Campo11 ,Campo12 ,Campo13 ,Campo14 ,Campo15 ,Campo16 ,Campo17 ,Campo18 ,Campo19 ,Campo20 ,Campo21 ,Campo22 ,Campo23 ,Campo24 ,Campo25 ,Campo26 ,Campo27 ,Campo28 ,Campo29 ,Campo30 ,Campo31 ,Campo32 )values(38,'','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','')
insert into @tbl_documentos_destino(Id_Documento ,Campo1  ,Campo2  ,Campo3  ,Campo4  ,Campo5  ,Campo6  ,Campo7  ,Campo8  ,Campo9  ,Campo10 ,Campo11 ,Campo12 ,Campo13 ,Campo14 ,Campo15 ,Campo16 ,Campo17 ,Campo18 ,Campo19 ,Campo20 ,Campo21 ,Campo22 ,Campo23 ,Campo24 ,Campo25 ,Campo26 ,Campo27 ,Campo28 ,Campo29 ,Campo30 ,Campo31 ,Campo32 )values(39,'','','','','D5-1','','','','','','','','','','','','','','D19-1','','D21-1','','D23-1','','','','','','','','','')
insert into @tbl_documentos_destino(Id_Documento ,Campo1  ,Campo2  ,Campo3  ,Campo4  ,Campo5  ,Campo6  ,Campo7  ,Campo8  ,Campo9  ,Campo10 ,Campo11 ,Campo12 ,Campo13 ,Campo14 ,Campo15 ,Campo16 ,Campo17 ,Campo18 ,Campo19 ,Campo20 ,Campo21 ,Campo22 ,Campo23 ,Campo24 ,Campo25 ,Campo26 ,Campo27 ,Campo28 ,Campo29 ,Campo30 ,Campo31 ,Campo32 )values(41,'','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','')
insert into @tbl_documentos_destino(Id_Documento ,Campo1  ,Campo2  ,Campo3  ,Campo4  ,Campo5  ,Campo6  ,Campo7  ,Campo8  ,Campo9  ,Campo10 ,Campo11 ,Campo12 ,Campo13 ,Campo14 ,Campo15 ,Campo16 ,Campo17 ,Campo18 ,Campo19 ,Campo20 ,Campo21 ,Campo22 ,Campo23 ,Campo24 ,Campo25 ,Campo26 ,Campo27 ,Campo28 ,Campo29 ,Campo30 ,Campo31 ,Campo32 )values(42,'','','','','','','','','','','','','','','','','','','','','D21-1','','','D24-1','','','','','','','','')
insert into @tbl_documentos_destino(Id_Documento ,Campo1  ,Campo2  ,Campo3  ,Campo4  ,Campo5  ,Campo6  ,Campo7  ,Campo8  ,Campo9  ,Campo10 ,Campo11 ,Campo12 ,Campo13 ,Campo14 ,Campo15 ,Campo16 ,Campo17 ,Campo18 ,Campo19 ,Campo20 ,Campo21 ,Campo22 ,Campo23 ,Campo24 ,Campo25 ,Campo26 ,Campo27 ,Campo28 ,Campo29 ,Campo30 ,Campo31 ,Campo32 )values(43,'D1-1','D2-1','D3-1','D4-1','D5-1','D6-1','D7-1','D8-1','D9-1','D10-1','D11-1','D12-1','D13-1','D14-1','D15-1','D16-1','','D18-1','D19-1','D20-1','D21-1','D22-1','D23-1','D24-1','D25-1','D26-1','D27-1','D28-1','D29-1','D30-1','D31-1','')


declare @tbl_documentos_destino_config table( 
	Documento_Id int,
	Destino varchar(100)
)

insert into @tbl_documentos_destino_config(Documento_Id, Destino)
select Id_Documento, Campo1  from @tbl_documentos_destino where Campo1  > '' union all   
select Id_Documento, Campo2  from @tbl_documentos_destino where Campo2  > '' union all   
select Id_Documento, Campo3  from @tbl_documentos_destino where Campo3  > '' union all   
select Id_Documento, Campo4  from @tbl_documentos_destino where Campo4  > '' union all   
select Id_Documento, Campo5  from @tbl_documentos_destino where Campo5  > '' union all   
select Id_Documento, Campo6  from @tbl_documentos_destino where Campo6  > '' union all   
select Id_Documento, Campo7  from @tbl_documentos_destino where Campo7  > '' union all   
select Id_Documento, Campo8  from @tbl_documentos_destino where Campo8  > '' union all   
select Id_Documento, Campo9  from @tbl_documentos_destino where Campo9  > '' union all  
select Id_Documento, Campo10 from @tbl_documentos_destino where Campo10 > '' union all  
select Id_Documento, Campo11 from @tbl_documentos_destino where Campo11 > '' union all  
select Id_Documento, Campo12 from @tbl_documentos_destino where Campo12 > '' union all  
select Id_Documento, Campo13 from @tbl_documentos_destino where Campo13 > '' union all  
select Id_Documento, Campo14 from @tbl_documentos_destino where Campo14 > '' union all  
select Id_Documento, Campo15 from @tbl_documentos_destino where Campo15 > '' union all  
select Id_Documento, Campo16 from @tbl_documentos_destino where Campo16 > '' union all  
select Id_Documento, Campo17 from @tbl_documentos_destino where Campo17 > '' union all  
select Id_Documento, Campo18 from @tbl_documentos_destino where Campo18 > '' union all  
select Id_Documento, Campo19 from @tbl_documentos_destino where Campo19 > '' union all  
select Id_Documento, Campo20 from @tbl_documentos_destino where Campo20 > '' union all  
select Id_Documento, Campo21 from @tbl_documentos_destino where Campo21 > '' union all  
select Id_Documento, Campo22 from @tbl_documentos_destino where Campo22 > '' union all  
select Id_Documento, Campo23 from @tbl_documentos_destino where Campo23 > '' union all  
select Id_Documento, Campo24 from @tbl_documentos_destino where Campo24 > '' union all  
select Id_Documento, Campo25 from @tbl_documentos_destino where Campo25 > '' union all  
select Id_Documento, Campo26 from @tbl_documentos_destino where Campo26 > '' union all  
select Id_Documento, Campo27 from @tbl_documentos_destino where Campo27 > '' union all  
select Id_Documento, Campo28 from @tbl_documentos_destino where Campo28 > '' union all  
select Id_Documento, Campo29 from @tbl_documentos_destino where Campo29 > '' union all  
select Id_Documento, Campo30 from @tbl_documentos_destino where Campo30 > '' union all  
select Id_Documento, Campo31 from @tbl_documentos_destino where Campo31 > '' union all  
select Id_Documento, Campo32 from @tbl_documentos_destino where Campo32 > '' 


Declare @Documento_Id int
Declare @Destino varchar(100)

Declare @SelDocumento_Id int
Declare @SelDestino_Id int

DECLARE cursor_destino CURSOR FOR 
SELECT Documento_Id, Destino FROM @tbl_documentos_destino_config
OPEN cursor_destino  
FETCH NEXT FROM cursor_destino INTO @Documento_Id, @Destino
WHILE @@FETCH_STATUS = 0  
BEGIN  
      DECLARE @temp_destino_Id int = 0
      select @SelDocumento_Id = Documento_Id from @tbl_documentos where Id = @Documento_Id
	  select @temp_destino_Id = REPLACE( (SUBSTRING(@Destino,  0, PATINDEX('%-%', @Destino))), 'D','')
	  select @SelDestino_Id = Destino_Id from @tbl_destinos_temp where Id = @temp_destino_Id
	  IF NOT EXISTS(SELECT 1 FROM DocumentoDestino WHERE Documento_Id = @SelDocumento_Id AND Destino_Id = @SelDestino_Id)
	     BEGIN
			insert into DocumentoDestino(Documento_Id,Destino_Id)values(@SelDocumento_Id,@SelDestino_Id)
		 END

FETCH NEXT FROM cursor_destino INTO @Documento_Id, @Destino
END 

CLOSE cursor_destino  
DEALLOCATE cursor_destino

SET NOCOUNT OFF
RETURN 0
