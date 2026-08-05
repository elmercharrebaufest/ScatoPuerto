BEGIN TRY;  
    BEGIN TRAN;

    SET IDENTITY_INSERT Bandera ON;

    insert into Bandera(Id, Abreviatura, Nombre) values(243,'LD','Latviana' );

    SET IDENTITY_INSERT Bandera OFF

    Update Destino set Activo = 0 where Id = 1;

    Update Destino set CodigoSap = 'ES', nacionalIdad = 'Española', Bandera_Id = 73 where Id = 2;
    Update Destino set CodigoSap = 'IT', nacionalIdad = 'Italiana', Bandera_Id = 113 where Id = 3;
    Update Destino set CodigoSap = 'PE', nacionalIdad = 'Peruana', Bandera_Id = 174 where Id = 4;
    Update Destino set CodigoSap = 'GB', nacionalIdad = 'Británica', Bandera_Id = 241 where Id = 5;
    Update Destino set CodigoSap = 'PH', nacionalIdad = 'Filipina', Bandera_Id = 80 where Id = 6;
    Update Destino set CodigoSap = 'ZA', nacionalIdad = 'Sudafricana', Bandera_Id = 205 where Id = 7;
    Update Destino set CodigoSap = 'NL', nacionalIdad = 'Holandesa', Bandera_Id = 167 where Id = 8;
    Update Destino set CodigoSap = 'PL', nacionalIdad = 'Polaca', Bandera_Id = 177 where Id = 9;
    Update Destino set CodigoSap = 'AU', nacionalIdad = 'Australiana', Bandera_Id = 16 where Id = 10;
    Update Destino set CodigoSap = 'NL', nacionalIdad = 'Holandesa', Bandera_Id = 167 where Id = 11;
    Update Destino set CodigoSap = 'IN', nacionalIdad = 'Hindú', Bandera_Id = 106 where Id = 14;
    Update Destino set CodigoSap = 'TH', nacionalIdad = 'Tailandesa', Bandera_Id = 211 where Id = 15;
    Update Destino set CodigoSap = 'CO', nacionalIdad = 'Colombiana', Bandera_Id = 52 where Id = 16;
    Update Destino set CodigoSap = 'PK', nacionalIdad = 'Pakistaní', Bandera_Id = 168 where Id = 17;
    Update Destino set CodigoSap = 'LY', nacionalIdad = 'Libia', Bandera_Id = 127 where Id = 18;
    Update Destino set CodigoSap = 'TN', nacionalIdad = 'Tunecina', Bandera_Id = 222 where Id = 19;
    Update Destino set CodigoSap = 'DZ', nacionalIdad = 'Argelina', Bandera_Id = 12 where Id = 20;
    Update Destino set CodigoSap = 'JP', nacionalIdad = 'Japonesa', Bandera_Id = 115 where Id = 21;
    Update Destino set CodigoSap = 'CN', nacionalIdad = 'Chino', Bandera_Id = 47 where Id = 22;
    Update Destino set CodigoSap = 'MA', nacionalIdad = 'Marroquí', Bandera_Id = 141 where Id = 24;
    Update Destino set CodigoSap = 'ID', nacionalIdad = 'Indonesia', Bandera_Id = 107 where Id = 25;
    Update Destino set CodigoSap = 'EG', nacionalIdad = 'Egipcia', Bandera_Id = 67 where Id = 26;
    Update Destino set CodigoSap = 'IE', nacionalIdad = 'Irlandesa', Bandera_Id = 110 where Id = 27;
    Update Destino set CodigoSap = 'TR', nacionalIdad = 'Turca', Bandera_Id = 225 where Id = 28;
    Update Destino set CodigoSap = 'EC', nacionalIdad = 'Ecuatoriana', Bandera_Id = 66 where Id = 30;
    Update Destino set CodigoSap = 'BD', nacionalIdad = 'Bangladesí', Bandera_Id = 21 where Id = 31;
    Update Destino set CodigoSap = 'US', nacionalIdad = 'Estadounidense', Bandera_Id = 75 where Id = 32;
    Update Destino set CodigoSap = 'PT', nacionalIdad = 'Portuguesa', Bandera_Id = 178 where Id = 33;
    Update Destino set CodigoSap = 'BE', nacionalIdad = 'Belga', Bandera_Id = 24 where Id = 34;
    Update Destino set CodigoSap = 'VN', nacionalIdad = 'Vietnamita', Bandera_Id = 233 where Id = 35;
    Update Destino set CodigoSap = 'DZ', nacionalIdad = 'Argelina', Bandera_Id = 12 where Id = 36;
    Update Destino set CodigoSap = 'CY', nacionalIdad = 'Chipriota', Bandera_Id = 48 where Id = 37;
    Update Destino set CodigoSap = 'SY', nacionalIdad = 'Siria', Bandera_Id = 201 where Id = 38;
    Update Destino set CodigoSap = 'MG', nacionalIdad = 'Madecasiana', Bandera_Id = 133 where Id = 39;
    Update Destino set CodigoSap = 'IR', nacionalIdad = 'Iraní', Bandera_Id = 108 where Id = 41;
    Update Destino set CodigoSap = 'NZ', nacionalIdad = 'Neozelandesa', Bandera_Id = 165 where Id = 42;
    Update Destino set CodigoSap = 'NL', nacionalIdad = 'Holandesa', Bandera_Id = 167 where Id = 43;
    Update Destino set CodigoSap = 'KP', nacionalIdad = 'Coreana', Bandera_Id = 57 where Id = 44;
    Update Destino set CodigoSap = 'CL', nacionalIdad = 'Chilena', Bandera_Id = 46 where Id = 46;
    Update Destino set CodigoSap = 'DE', nacionalIdad = 'Alemana', Bandera_Id = 4 where Id = 47;
    Update Destino set CodigoSap = 'MY', nacionalIdad = 'Malaya', Bandera_Id = 134 where Id = 48;
    Update Destino set CodigoSap = 'LB', nacionalIdad = 'Libanesa', Bandera_Id = 125 where Id = 49;
    Update Destino set CodigoSap = 'FR', nacionalIdad = 'Francesa', Bandera_Id = 83 where Id = 50;
    Update Destino set CodigoSap = 'DK', nacionalIdad = 'Danesa', Bandera_Id = 63 where Id = 51;

    Update Destino set Activo = 0 where Id = 54;

    Update Destino set CodigoSap = 'PL', nacionalIdad = 'Polaca', Bandera_Id = 177 where Id = 55;
    Update Destino set CodigoSap = 'PA', nacionalIdad = 'Panameña', Bandera_Id = 171 where Id = 57;
    Update Destino set CodigoSap = 'GT', nacionalIdad = 'Guatemalteca', Bandera_Id = 95 where Id = 60;
    Update Destino set CodigoSap = 'DO', nacionalIdad = 'Dominicana', Bandera_Id = 65 where Id = 61;
    Update Destino set CodigoSap = 'KR', nacionalIdad = 'Coreana', Bandera_Id = 58 where Id = 64;
    Update Destino set CodigoSap = 'RU', nacionalIdad = 'Rusa', Bandera_Id = 184 where Id = 66;
    Update Destino set CodigoSap = 'MZ', nacionalIdad = 'Mozambiqueña', Bandera_Id = 153 where Id = 67;
    Update Destino set CodigoSap = 'BR', nacionalIdad = 'Brasileña', Bandera_Id = 33 where Id = 68;
    Update Destino set CodigoSap = 'YE', nacionalIdad = 'Yemenita', Bandera_Id = 237 where Id = 69;
    Update Destino set CodigoSap = 'GR', nacionalIdad = 'Griega', Bandera_Id = 91 where Id = 70;
    Update Destino set CodigoSap = 'MA', nacionalIdad = 'Marroquí', Bandera_Id = 141 where Id = 71;
    Update Destino set CodigoSap = 'OM', nacionalIdad = 'Omaní', Bandera_Id = 166 where Id = 73;
    Update Destino set CodigoSap = 'AE', nacionalIdad = 'Árabe', Bandera_Id = 69 where Id = 75;
    Update Destino set CodigoSap = 'SA', nacionalIdad = 'Saudí', Bandera_Id = 11 where Id = 76;
    Update Destino set CodigoSap = 'IT', nacionalIdad = 'Italiana', Bandera_Id = 113 where Id = 77;
    Update Destino set CodigoSap = 'TZ', nacionalIdad = 'Tanzana', Bandera_Id = 213 where Id = 78;
    Update Destino set CodigoSap = 'KE', nacionalIdad = 'Keniana', Bandera_Id = 118 where Id = 79;
    Update Destino set CodigoSap = 'US', nacionalIdad = 'Estadounidense', Bandera_Id = 75 where Id = 80;
    Update Destino set CodigoSap = 'IT', nacionalIdad = 'Italiana', Bandera_Id = 113 where Id = 81;
    Update Destino set CodigoSap = 'SI', nacionalIdad = 'Eslovenia', Bandera_Id = 72 where Id = 82;
    Update Destino set CodigoSap = 'RO', nacionalIdad = 'Rumana', Bandera_Id = 183 where Id = 83;
    Update Destino set CodigoSap = 'CU', nacionalIdad = 'Cubana', Bandera_Id = 62 where Id = 84;

    Update Destino set Activo = 0 where Id = 86;

    Update Destino set CodigoSap = 'LD', nacionalIdad = 'Latviana', Bandera_Id = 243 where Id = 89;
    Update Destino set CodigoSap = 'SY', nacionalIdad = 'Siria', Bandera_Id = 201 where Id = 91;
    Update Destino set CodigoSap = 'GB', nacionalIdad = 'Británica', Bandera_Id = 241 where Id = 92;
    Update Destino set CodigoSap = 'LT', nacionalIdad = 'Lituana', Bandera_Id = 129 where Id = 94;
    Update Destino set CodigoSap = 'CR', nacionalIdad = 'Costarricense', Bandera_Id = 60 where Id = 95;
    Update Destino set CodigoSap = 'VN', nacionalIdad = 'Vietnamita', Bandera_Id = 233 where Id = 97;
    Update Destino set CodigoSap = 'VE', nacionalIdad = 'Venezolana', Bandera_Id = 232 where Id = 98;
    Update Destino set CodigoSap = 'SA', nacionalIdad = 'Saudí', Bandera_Id = 11 where Id = 99;
    Update Destino set CodigoSap = 'AR', nacionalIdad = 'Argentina', Bandera_Id = 13 where Id = 100;
    Update Destino set CodigoSap = 'SN', nacionalIdad = 'Senegalesa', Bandera_Id = 196 where Id = 102;
    Update Destino set CodigoSap = 'AR', nacionalIdad = 'Argentina', Bandera_Id = 13 where Id = 103;
    Update Destino set CodigoSap = 'CI', nacionalIdad = 'Marfilense', Bandera_Id = 59 where Id = 104;
    Update Destino set CodigoSap = 'BN', nacionalIdad = 'De Brunei', Bandera_Id = 34 where Id = 106;
    Update Destino set CodigoSap = 'CG', nacionalIdad = 'Congoleña', Bandera_Id = 55 where Id = 109;
    Update Destino set CodigoSap = 'NA', nacionalIdad = 'Namibia', Bandera_Id = 155 where Id = 110;
    Update Destino set CodigoSap = 'MU', nacionalIdad = 'Mauriciense', Bandera_Id = 144 where Id = 113;
    Update Destino set CodigoSap = 'MU', nacionalIdad = 'Mauriciense', Bandera_Id = 144 where Id = 114;
    Update Destino set CodigoSap = 'IL', nacionalIdad = 'Israelí', Bandera_Id = 112 where Id = 116;
    Update Destino set CodigoSap = 'HK', nacionalIdad = 'China', Bandera_Id = 104 where Id = 117;
    Update Destino set CodigoSap = 'AE', nacionalIdad = 'Árabe', Bandera_Id = 69 where Id = 119;
    Update Destino set CodigoSap = 'BY', nacionalIdad = 'Bielorrusa', Bandera_Id = 23 where Id = 121;
    Update Destino set CodigoSap = 'MR', nacionalIdad = 'Mauritana', Bandera_Id = 145 where Id = 122;
    Update Destino set CodigoSap = 'GH', nacionalIdad = 'Ghanesa', Bandera_Id = 88 where Id = 123;
    Update Destino set CodigoSap = 'CV', nacionalIdad = 'Caboverdiana', Bandera_Id = 38 where Id = 124;
    Update Destino set CodigoSap = 'CM', nacionalIdad = 'Camerunesa', Bandera_Id = 41 where Id = 126;

    Update Destino set Activo = 0 where Id = 128;
    Update Destino set Activo = 0 where Id = 129;
    Update Destino set Activo = 0 where Id = 130;
    Update Destino set Activo = 0 where Id = 131;
    Update Destino set Activo = 0 where Id = 132;
    Update Destino set Activo = 0 where Id = 133;
    Update Destino set Activo = 0 where Id = 134;
    Update Destino set Activo = 0 where Id = 136;

    Update Destino set CodigoSap = 'LV', nacionalIdad = 'Letona', Bandera_Id = 124 where Id = 139;

    Update Destino set Activo = 0 where Id = 140;
    Update Destino set Activo = 0 where Id = 141;

    Update Destino set CodigoSap = 'TW', nacionalIdad = 'Taiwanesa', Bandera_Id = 212 where Id = 142;
    Update Destino set CodigoSap = 'JO', nacionalIdad = 'Jordana', Bandera_Id = 116 where Id = 143;

    Update Destino set Activo = 0 where Id = 144;
    Update Destino set Activo = 0 where Id = 146;
    Update Destino set Activo = 0 where Id = 147;
    Update Destino set Activo = 0 where Id = 150;
    Update Destino set Activo = 0 where Id = 151;
    Update Destino set Activo = 0 where Id = 152;
    Update Destino set Activo = 0 where Id = 153;
    Update Destino set Activo = 0 where Id = 154;
    Update Destino set Activo = 0 where Id = 155;
    Update Destino set Activo = 0 where Id = 156;
    Update Destino set Activo = 0 where Id = 157;

    Update Destino set CodigoSap = 'NG', nacionalIdad = 'Nigeriana', Bandera_Id = 160 where Id = 158;
    Update Destino set CodigoSap = 'UG', nacionalIdad = 'Ugandesa', Bandera_Id = 228 where Id = 159;

    Update Destino set Activo = 0 where Id = 160;
    Update Destino set Activo = 0 where Id = 163;

    Update Destino set CodigoSap = 'GT', nacionalIdad = 'Guatemalteca', Bandera_Id = 95 where Id = 164;

    Update Destino set Activo = 0 where Id = 165;

    Update Destino set CodigoSap = 'IN', nacionalIdad = 'Hindú', Bandera_Id = 106 where Id = 166;
    Update Destino set CodigoSap = 'IQ', nacionalIdad = 'Iraquí', Bandera_Id = 109 where Id = 168;
    Update Destino set CodigoSap = 'EG', nacionalIdad = 'Egipcia', Bandera_Id = 67 where Id = 169;
    Update Destino set CodigoSap = 'NL', nacionalIdad = 'Holandesa', Bandera_Id = 167 where Id = 170;
    Update Destino set CodigoSap = 'MU', nacionalIdad = 'Mauriciense', Bandera_Id = 144 where Id = 171;
    Update Destino set CodigoSap = 'GN', nacionalIdad = 'Guineana', Bandera_Id = 97 where Id = 172;
    Update Destino set CodigoSap = 'AO', nacionalIdad = 'Angolana', Bandera_Id = 6 where Id = 173;
    Update Destino set CodigoSap = 'IQ', nacionalIdad = 'Iraquí', Bandera_Id = 109 where Id = 174;
    Update Destino set CodigoSap = 'AE', nacionalIdad = 'Árabe', Bandera_Id = 69 where Id = 175;
    Update Destino set CodigoSap = 'DO', nacionalIdad = 'Dominicana', Bandera_Id = 65 where Id = 176;
    Update Destino set CodigoSap = 'KR', nacionalIdad = 'Coreana', Bandera_Id = 58 where Id = 177;
    Update Destino set CodigoSap = 'DZ', nacionalIdad = 'Argelina', Bandera_Id = 12 where Id = 178;
    Update Destino set CodigoSap = 'KE', nacionalIdad = 'Keniana', Bandera_Id = 118 where Id = 179;
    Update Destino set CodigoSap = 'MX', nacionalIdad = 'Mexicana', Bandera_Id = 147 where Id = 180;
    Update Destino set CodigoSap = 'KW', nacionalIdad = 'Kuwaití', Bandera_Id = 121 where Id = 181;
    Update Destino set CodigoSap = 'ZA', nacionalIdad = 'Sudafricana', Bandera_Id = 205 where Id = 182;
    Update Destino set CodigoSap = 'MM', nacionalIdad = 'Myanmar', Bandera_Id = 154 where Id = 183;

    Update Destino set Activo = 0 where Id = 184;

    Update Destino set CodigoSap = 'VN', nacionalIdad = 'Vietnamita', Bandera_Id = 233 where Id = 185;
    Update Destino set CodigoSap = 'GE', nacionalIdad = 'Georgiana', Bandera_Id = 86 where Id = 186;
    Update Destino set CodigoSap = 'LR', nacionalIdad = 'Liberiana', Bandera_Id = 126 where Id = 187;
    Update Destino set CodigoSap = 'CA', nacionalIdad = 'Canadiense', Bandera_Id = 42 where Id = 188;

    Update Destino set CodigoSap = 'ZPE', nacionalIdad = '', Bandera_Id = NULL where Id = 189;
    Update Destino set CodigoSap = 'ZPE', nacionalIdad = '', Bandera_Id = NULL where Id = 190;
    Update Destino set CodigoSap = 'ZPE', nacionalIdad = '', Bandera_Id = NULL where Id = 191;

    Update Destino set CodigoSap = 'SV', nacionalIdad = 'Salvadoreña', Bandera_Id = 68 where Id = 192;
    Update Destino set CodigoSap = 'NI', nacionalIdad = 'Nicaragüense', Bandera_Id = 158 where Id = 193;
    Update Destino set CodigoSap = 'DZ', nacionalIdad = 'Argelina', Bandera_Id = 12 where Id = 194;
    Update Destino set CodigoSap = 'QA', nacionalIdad = 'Qatarí', Bandera_Id = 180 where Id = 195;
    Update Destino set CodigoSap = 'US', nacionalIdad = 'Estadounidense', Bandera_Id = 75 where Id = 196;
    Update Destino set CodigoSap = 'ES', nacionalIdad = 'Española', Bandera_Id = 73 where Id = 197;
    Update Destino set CodigoSap = 'BB', nacionalIdad = 'De Barbados', Bandera_Id = 22 where Id = 198;

    -- INSERTS

    SET IDENTITY_INSERT Destino ON;

    DECLARE @Id int = (SELECT MAX(Id) + 1 FROM Destino);

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Afganistán',1,'AF','Afgana',1);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Arg. Exporta',1,'AX','Argentina EXP',2);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Albania',1,'AL','Albana',3);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Andorra',1,'AD','Andorrana',5);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Anguilla',1,'AI','Islas Gland',7);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Antártida',1,'AQ','Antártica',8);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Antigua y Barbuda',1,'AG','Antigüeña',9);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Antillas Holandesas',1,'AN','Holandesa',10);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Armenia',1,'AM','Armenia',14);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Aruba',1,'AW','De Aruba',15);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Austria',1,'AT','Austríaca',17);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Azerbaiyán',1,'AZ','Azerbaiyana',18);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Bahamas',1,'BS','Bahameña',19);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Bahréin',1,'BH','Bahreiní',20);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Belice',1,'BZ','Beliceña',25);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Benin',1,'BJ','Beninesa',26);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Bermudas',1,'BM','De Bermudas',27);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Bután',1,'BT','Butanesa',28);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Bolivia',1,'BO','Boliviana',29);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Bosnia y Herzegovina',1,'BA','Bosnia',30);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Botsuana',1,'BW','Botsuana',31);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Isla Bouvet',1,'BV','Islas Bouvet',32);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Bulgaria',1,'BG','Búlgara',35);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Burkina Faso',1,'BF','Burkina Faso',36);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Burundi',1,'BI','Burundesa',37);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Islas Caimán',1,'KY','Neozelandesa',39);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Camboya',1,'KH','Camboyana',40);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'República Centroafricana',1,'CF','Centroafricana',43);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Chad',1,'TD','Chadiana',44);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'República Checa',1,'CZ','Checa',45);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Isla de Navidad',1,'CX','Australiana',49);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Ciudad Vaticano',1,'VA','Ciudad Vaticano',50);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Islas Cocos',1,'CC','Australiana',51);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Comoras',1,'KM','Comorana',53);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'República Congo',1,'CD','Congoleña',54);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Islas Cook',1,'CK','Islas Cook',56);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Croacia',1,'HR','Croata',61);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Dominica',1,'DM','Dominicana',64);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Eritrea',1,'ER','Eritrea',70);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Eslovaquia',1,'SK','Eslovaca',71);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Islas ultramarinas de Estados Unidos',1,'UM','Isl. Minor Outl',74);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Estonia',1,'EE','Estonia',76);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Etiopía',1,'ET','Etíope',77);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Inglaterra',1,'GB','Inglesa',78);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Islas Feroe',1,'FO','Danesa',79);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Finlandia',1,'FI','Finlandesa',81);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Fiyi',1,'FJ','Fiyiana',82);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Gabón',1,'GA','Gabonesa',84);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Gambia',1,'GM','Gambiana',85);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Islas Georgias del Sur y Sandwich del Sur',1,'GS','',87);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Gibraltar',1,'GI','Británica',89);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Granada',1,'GD','Granadina',90);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Groenlandia',1,'GL','Danesa',92);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Guadalupe',1,'GP','Francesa',93);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Guám',1,'GU','Estadounidense',94);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Guayana Francesa',1,'GF','Francesa',96);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Guinea Ecuatorial',1,'GQ','Guineana',98);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Guinea-Bissau',1,'GW','De Guinea-Bissau',99);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Guyana',1,'GY','Guyanesa',100);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Haití',1,'HT','Haitiana',101);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Islas Heard y McDonald',1,'HM','Heard/Is.McDon',102);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Honduras',1,'HN','Hondureña',103);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Hungría',1,'HU','Húngara',105);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Islandia',1,'IS','Islandesa',111);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Jamaica',1,'JM','Jamaicana',114);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Kazajistán',1,'KZ','Kazajistaní',117);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Kirguistán',1,'KG','Kirguiza',119);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Kiribati',1,'KI','Kiribatiana',120);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Laos',1,'LA','Laosiana',122);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Lesoto',1,'LS','Lesoto',123);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Liechtenstein',1,'LI','Liechtenstein',128);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Luxemburgo',1,'LU','Luxemburguesa',130);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Macao',1,'MO','Portuguesa',131);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Macedonia',1,'MK','Macedonia',132);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Malaui',1,'MW','Malauí',135);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Maldivas',1,'MV','De Maldivas',136);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Malí',1,'ML','Malí',137);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Malta',1,'MT','Maltesa',138);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Islas Malvinas',1,'FK','Británica',139);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Islas Marianas del Norte',1,'MP','Mariana',140);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Islas Marshall',1,'MH','Islas Marshall',142);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Martinica',1,'MQ','Francesa',143);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Mayotte',1,'YT','Francesa',146);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Micronesia',1,'FM','Micronesia',148);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Moldavia',1,'MD','Moldava',149);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Mónaco',1,'MC','Monegasca',150);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Mongolia',1,'MN','Mongola',151);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Montserrat',1,'MS','De Montserrat',152);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Nauru',1,'NR','Nauruana',156);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Nepal',1,'NP','Nepalí',157);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Níger',1,'NE','Nigeriense',159);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Niue',1,'NU','Islas Niue',161);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Norfolk',1,'NF','Islas Norfolk',162);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Noruega',1,'NO','Noruega',163);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Nueva Caledonia',1,'NC','Francés',164);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Palaos',1,'PW','Palaos',169);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Palestina',1,'PS','Palestina',170);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Papúa Nueva Guinea',1,'PG','Papuana',172);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Paraguay',1,'PY','Paraguaya',173);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Islas Pitcairn',1,'PN','Británica',175);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Polinesia Francesa',1,'PF','Francesa',176);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Puerto Rico',1,'PR','Estadounidense',179);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Reunión',1,'RE','Francesa',181);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Ruanda',1,'RW','Ruandesa',182);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Sáhara Occidental',1,'EH','Francesa',185);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Salomón',1,'SB','Salomonesa',186);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Samoa Occidental',1,'WS','Samoana',187);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Samoa America',1,'AS','Samoana',188);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'San Cristóbal y Nevis',1,'KN','De St.Chr. y Nevis',189);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'San Marino',1,'SM','Sanmarinesa',190);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'San Pedro y Miquelón',1,'PM','Francesa',191);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'San Vicente',1,'VC','De S.Vicente',192);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Santa Elena',1,'SH','Santa Elena',193);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Santa Lucía',1,'LC','Luciana',194);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Santo Tomé y Príncipe',1,'ST','Santomense',195);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Serbia y Montenegro',1,'CS','Serb.montenegr.',197);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Seychelles',1,'SC','De Seychelles',198);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Sierra Leona',1,'SL','De Sierra Leona',199);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Singapur',1,'SG','Singaporeana',200);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Somalia',1,'SO','Somalí',202);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Sri Lanka',1,'LK','Ceilanesa',203);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Suazilandia',1,'SZ','Suazili',204);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Sudán',1,'SD','Sudanesa',206);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Suecia',1,'SE','Sueca',207);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Suiza',1,'CH','Suiza',208);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Surinám',1,'SR','Surinamesa',209);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Svalbard',1,'SJ','Noruego',210);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Tayikistán',1,'TJ','Tayik',214);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Territorio Británico del Océano Índico',1,'IO','Terr.br.Oc.Ind.',215);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Territorios Australes Franceses',1,'TF','Francesa',216);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Timor Oriental',1,'TL','Timor Oriental',217);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Togo',1,'TG','Togolesa',218);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Tokelau',1,'TK','Islas Tokelau',219);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Tonga',1,'TO','Tongana',220);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Trinidad y Tobago',1,'TT','Trinitense',221);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Islas Turcas y Caicos',1,'TC','Turks y Caicos',223);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Turkmenistán',1,'TM','Turcomana',224);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Tuvalú',1,'TV','De Tuvalú',226);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Ucrania',1,'UA','Ucraniana',227);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Uruguay',1,'UY','Uruguaya',229);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Uzbekistán',1,'UZ','Uzbega',230);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Vanuatu',1,'VU','Vanuatí',231);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Islas Vírgenes GB',1,'VG','Británica',234);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Islas Vírgenes de los Estados Unidos',1,'VI','Estadounidense',235);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Wallis y Futuna',1,'WF','De Wallis y Futuna',236);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Yibuti',1,'DJ','Yibutiense',238);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Zambia',1,'ZM','Zambia',239);
    SET @Id = @Id + 1;

    insert into destino (Id,nombre, activo, CodigoSap, nacionalIdad, Bandera_Id) values (@Id,'Zimbabue',1,'ZW','Zimabua',240);

    SET IDENTITY_INSERT Destino OFF

    COMMIT;

END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK;

    BEGIN TRY
        SET IDENTITY_INSERT Destino OFF;
    END TRY
    BEGIN CATCH
    END CATCH

    BEGIN TRY
        SET IDENTITY_INSERT Bandera OFF;
    END TRY
    BEGIN CATCH
    END CATCH;

    THROW;
END CATCH;