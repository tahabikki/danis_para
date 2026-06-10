insert into categories (nom) values
('DERMOCOSMÉTIQUE'),
('COMPLÉMENT ALIMENTAIRE'),
('PHYTO-AROMATHÉRAPIE'),
('ORTHOPÉDIE'),
('MATÉRIEL MÉDICAL'),
('ESPACE BÉBÉ & MAMAN'),
('HYGIÈNE & SOINS'),
('NUTRITION & DIÉTÉTIQUE'),
('SOLAIRES & PROTECTION'),
('PREMIERS SOINS')
on conflict (nom) do nothing;

insert into produits (id, nom, description, prix, stock, image_url, categorie) values
-- DERMOCOSMÉTIQUE (5)
('10000000-0000-0000-0000-000000000001', 'Crème hydratante apaisante', 'Soin quotidien pour peaux sensibles avec effet confort immédiat.', 149, 18, '/products/creme-hydratante.jpeg', 'DERMOCOSMÉTIQUE'),
('10000000-0000-0000-0000-000000000002', 'Sérum éclat vitamine C', 'Concentré illuminateur pour uniformiser le teint et réduire la fatigue cutanée.', 229, 12, '/products/serum-vitamine-c.jpeg', 'DERMOCOSMÉTIQUE'),
('10000000-0000-0000-0000-000000000024', 'Crème anti-âge réparatrice', 'Soin nuit à l''acide hyaluronique pour régénérer la peau mature.', 319, 9, '/products/creme-anti-age.jpeg', 'DERMOCOSMÉTIQUE'),
('10000000-0000-0000-0000-000000000025', 'Nettoyant visage doux', 'Gel moussant sans savon pour peaux sensibles et réactives.', 119, 23, '/products/nettoyant-visage.jpeg', 'DERMOCOSMÉTIQUE'),
('10000000-0000-0000-0000-000000000044', 'Contour des yeux anti-poches', 'Soin frais décongestionnant aux actifs végétaux pour un regard reposé.', 189, 11, '/products/contour-yeux.jpeg', 'DERMOCOSMÉTIQUE'),

-- COMPLÉMENT ALIMENTAIRE (5)
('20000000-0000-0000-0000-000000000003', 'Magnésium marin + B6', 'Complément pour la vitalité, la gestion du stress et le bon fonctionnement musculaire.', 119, 34, '/products/magnesium.jpeg', 'COMPLÉMENT ALIMENTAIRE'),
('20000000-0000-0000-0000-000000000004', 'Oméga 3 premium', 'Capsules riches en acides gras essentiels pour le bien-être cardiovasculaire.', 189, 22, '/products/omega3.jpeg', 'COMPLÉMENT ALIMENTAIRE'),
('20000000-0000-0000-0000-000000000019', 'Vitamine D3 2000 UI', 'Complément quotidien pour l''immunité et la santé osseuse.', 99, 42, '/products/vitamine-d3.jpeg', 'COMPLÉMENT ALIMENTAIRE'),
('20000000-0000-0000-0000-000000000020', 'Probiotiques flore intestinale', 'Gélules enrichies en souches lactiques pour l''équilibre digestif.', 159, 28, '/products/probiotiques.jpeg', 'COMPLÉMENT ALIMENTAIRE'),
('20000000-0000-0000-0000-000000000021', 'Collagène marin hydratation', 'Poudre de collagène hydrolysé pour la peau, les cheveux et les articulations.', 249, 17, '/products/collagene-marin.jpeg', 'COMPLÉMENT ALIMENTAIRE'),

-- PHYTO-AROMATHÉRAPIE (5)
('30000000-0000-0000-0000-000000000005', 'Huile essentielle lavande', 'Solution aromatique relaxante adaptée à la diffusion et aux routines bien-être.', 89, 15, '/products/lavande.jpeg', 'PHYTO-AROMATHÉRAPIE'),
('30000000-0000-0000-0000-000000000012', 'Infusion digestion légère', 'Mélange de plantes aux notes douces pour accompagner les repas copieux.', 64, 27, '/products/infusion-digestion.jpeg', 'PHYTO-AROMATHÉRAPIE'),
('30000000-0000-0000-0000-000000000017', 'Huile essentielle menthe poivrée', 'Tonique rafraîchissant idéal pour la concentration et la digestion.', 79, 19, '/products/menthe-poivree.jpeg', 'PHYTO-AROMATHÉRAPIE'),
('30000000-0000-0000-0000-000000000018', 'Tisane détox printanière', 'Mélange de plantes purifiantes pour une cure de printemps en douceur.', 54, 31, '/products/tisane-detox.jpeg', 'PHYTO-AROMATHÉRAPIE'),
('30000000-0000-0000-0000-000000000042', 'Gélules de curcuma bio', 'Complément anti-inflammatoire naturel à base de curcuma et poivre noir.', 109, 24, '/products/curcuma-bio.jpeg', 'PHYTO-AROMATHÉRAPIE'),

-- ORTHOPÉDIE (5)
('40000000-0000-0000-0000-000000000006', 'Gel chauffant articulation', 'Gel de massage pour soulager les zones de tension et les inconforts articulaires.', 134, 9, '/products/gel-articulation.jpeg', 'ORTHOPÉDIE'),
('40000000-0000-0000-0000-000000000011', 'Ceinture lombaire confort', 'Maintien léger pour accompagner les activités quotidiennes et le dos sensible.', 259, 6, '/products/ceinture-lombaire.jpeg', 'ORTHOPÉDIE'),
('40000000-0000-0000-0000-000000000015', 'Genouillère de maintien', 'Soutien articulaire ajustable pour le genou, idéale pour la rééducation.', 179, 11, '/products/genouillere.jpeg', 'ORTHOPÉDIE'),
('40000000-0000-0000-0000-000000000016', 'Coussin cervical ergonomique', 'Oreiller mémoire de forme pour soulager les tensions cervicales.', 229, 8, '/products/coussin-cervical.jpeg', 'ORTHOPÉDIE'),
('40000000-0000-0000-0000-000000000041', 'Chevillère élastique de maintien', 'Attelle souple pour cheville offrant compression et soutien en cas d''entorse.', 149, 14, '/products/chevillere.jpeg', 'ORTHOPÉDIE'),

-- MATÉRIEL MÉDICAL (5)
('50000000-0000-0000-0000-000000000007', 'Tensiomètre digital bras', 'Appareil simple et fiable pour la surveillance quotidienne de la tension à domicile.', 499, 7, '/products/tensiometre.jpeg', 'MATÉRIEL MÉDICAL'),
('50000000-0000-0000-0000-000000000008', 'Thermomètre infrarouge', 'Mesure rapide et précise pour toute la famille, sans contact.', 279, 11, '/products/thermometre.jpeg', 'MATÉRIEL MÉDICAL'),
('50000000-0000-0000-0000-000000000013', 'Oxymètre de pouls digital', 'Appareil compact pour mesurer la saturation en oxygène et le pouls.', 199, 14, '/products/oxymetre.jpeg', 'MATÉRIEL MÉDICAL'),
('50000000-0000-0000-0000-000000000014', 'Masque respiratoire réutilisable', 'Protection respiratoire lavable avec filtres interchangeables.', 89, 25, '/products/masque-respiratoire.jpeg', 'MATÉRIEL MÉDICAL'),
('50000000-0000-0000-0000-000000000040', 'Nébuliseur compresseur', 'Appareil de nébulisation performant pour traitements respiratoires à domicile.', 449, 6, '/products/nebuliseur.jpeg', 'MATÉRIEL MÉDICAL'),

-- ESPACE BÉBÉ & MAMAN (5)
('60000000-0000-0000-0000-000000000009', 'Lait de toilette bébé', 'Nettoie et protège la peau délicate des nourrissons sans dessécher.', 98, 21, '/products/lait-bebe.jpeg', 'ESPACE BÉBÉ & MAMAN'),
('60000000-0000-0000-0000-000000000010', 'Crème change protectrice', 'Apaise les rougeurs et forme une barrière protectrice durable.', 87, 16, '/products/creme-change.jpeg', 'ESPACE BÉBÉ & MAMAN'),
('60000000-0000-0000-0000-000000000022', 'Lingettes bébé sans parfum', 'Lot de 80 lingettes douces et hypoallergéniques pour le change.', 39, 45, '/products/lingettes-bebe.jpeg', 'ESPACE BÉBÉ & MAMAN'),
('60000000-0000-0000-0000-000000000023', 'Tire-lait manuel confort', 'Tire-lait compact et silencieux avec embout en silicone doux.', 299, 5, '/products/tire-lait.jpeg', 'ESPACE BÉBÉ & MAMAN'),
('60000000-0000-0000-0000-000000000043', 'Biberon anti-colique 250ml', 'Biberon ergonomique avec système anti-colique et tétine en silicone.', 89, 32, '/products/biberon-anti-colique.jpeg', 'ESPACE BÉBÉ & MAMAN'),

-- HYGIÈNE & SOINS (5)
('70000000-0000-0000-0000-000000000026', 'Gel hydroalcoolique mains', 'Solution antiseptique 70% alcool pour une désinfection rapide.', 29, 60, '/products/gel-hydroalcoolique.jpeg', 'HYGIÈNE & SOINS'),
('70000000-0000-0000-0000-000000000027', 'Savon surgras nature', 'Savon enrichi en beurre de karité pour les peaux sèches et fragiles.', 45, 33, '/products/savon-surgras.jpeg', 'HYGIÈNE & SOINS'),
('70000000-0000-0000-0000-000000000028', 'Brosses à dents premium lot de 3', 'Brosses à dents à poils souples en bambou biodégradable.', 69, 28, '/products/brosses-dents.jpeg', 'HYGIÈNE & SOINS'),
('70000000-0000-0000-0000-000000000029', 'Déodorant naturel sans aluminium', 'Déodorant stick à base de bicarbonate et d''huiles essentielles.', 59, 20, '/products/deodorant-naturel.jpeg', 'HYGIÈNE & SOINS'),
('70000000-0000-0000-0000-000000000045', 'Shampooing doux cheveux gras', 'Shampooing purifiant à l''ortie et au citron pour réguler le sébum.', 79, 22, '/products/shampooing-cheveux-gras.jpeg', 'HYGIÈNE & SOINS'),

-- NUTRITION & DIÉTÉTIQUE (5)
('80000000-0000-0000-0000-000000000030', 'Barre protéinée chocolat', 'Snack riche en protéines sans sucre ajouté, idéal en collation.', 35, 50, '/products/barre-proteinee.jpeg', 'NUTRITION & DIÉTÉTIQUE'),
('80000000-0000-0000-0000-000000000031', 'Shake protéiné vanille', 'Poudre protéinée whey isolate pour la récupération musculaire.', 279, 14, '/products/shake-vanille.jpeg', 'NUTRITION & DIÉTÉTIQUE'),
('80000000-0000-0000-0000-000000000032', 'Infusion brûle-graisse', 'Mélange de thé vert, gingembre et citron pour accompagner l''effort.', 49, 36, '/products/infusion-brule-graisse.jpeg', 'NUTRITION & DIÉTÉTIQUE'),
('80000000-0000-0000-0000-000000000033', 'Spiruline pure en poudre', 'Super-aliment riche en protéines, fer et antioxydants naturels.', 139, 19, '/products/spiruline.jpeg', 'NUTRITION & DIÉTÉTIQUE'),
('80000000-0000-0000-0000-000000000046', 'Flocons d''avoine complets', 'Avoine biologique riche en fibres pour un petit-déjeuner sain et rassasiant.', 45, 38, '/products/flocons-avoine.jpeg', 'NUTRITION & DIÉTÉTIQUE'),

-- SOLAIRES & PROTECTION (5)
('90000000-0000-0000-0000-000000000034', 'Crème solaire SPF50+ visage', 'Protection solaire haute résistante à l''eau pour peaux sensibles.', 169, 13, '/products/creme-solaire-spf50.jpeg', 'SOLAIRES & PROTECTION'),
('90000000-0000-0000-0000-000000000035', 'Spray solaire SPF30 corps', 'Protection solaire légère et non collante pour tout le corps.', 129, 21, '/products/spray-solaire-spf30.jpeg', 'SOLAIRES & PROTECTION'),
('90000000-0000-0000-0000-000000000036', 'After-sun apaisant aloe vera', 'Gel après-soleil hydratant à l''aloe vera pour calmer les irritations.', 89, 17, '/products/after-sun-aloe.jpeg', 'SOLAIRES & PROTECTION'),
('90000000-0000-0000-0000-000000000047', 'Huile solaire bronzante SPF15', 'Huile nourrissante aux carottes pour un bronzage doré et protégé.', 119, 15, '/products/huile-solaire-spf15.jpeg', 'SOLAIRES & PROTECTION'),
('90000000-0000-0000-0000-000000000048', 'Stick solaire lèvres SPF50', 'Baume à lèvres solaire haute protection pour les lèvres sensibles.', 49, 28, '/products/stick-levres-spf50.jpeg', 'SOLAIRES & PROTECTION'),

-- PREMIERS SOINS (5)
('a0000000-0000-0000-0000-000000000037', 'Pansements cicatrisants lot de 20', 'Pansements hydro-colloïdes pour une cicatrisation accélérée.', 49, 40, '/products/pansements-cicatrisants.jpeg', 'PREMIERS SOINS'),
('a0000000-0000-0000-0000-000000000038', 'Solution antiseptique sans alcool', 'Antiseptique doux à base de chlorhexidine pour plaies superficielles.', 69, 26, '/products/antiseptique.jpeg', 'PREMIERS SOINS'),
('a0000000-0000-0000-0000-000000000039', 'Compresses stériles non tissées', 'Lot de 50 compresses stériles 10x10 cm pour soins et pansements.', 39, 35, '/products/compresses-steriles.jpeg', 'PREMIERS SOINS'),
('a0000000-0000-0000-0000-000000000049', 'Bandage cohésif autoadhésif', 'Bande extensible qui adhère à elle-même pour maintien musculaire léger.', 59, 19, '/products/bandage-cohesif.jpeg', 'PREMIERS SOINS'),
('a0000000-0000-0000-0000-000000000050', 'Pince à épiler précision', 'Pince à épiler en acier inoxydable à bouts biseautés pour une précision parfaite.', 35, 30, '/products/pince-a-epiler.jpeg', 'PREMIERS SOINS')
on conflict (id) do nothing;

insert into clients (id, nom, telephone, total_achats) values
('e0000000-0000-0000-0000-000000000001', 'Salma El Idrissi', '0612345678', 378),
('e0000000-0000-0000-0000-000000000002', 'Youssef Ait Ali', '0667891234', 499),
('e0000000-0000-0000-0000-000000000003', 'Nadia Bennani', '0677001122', 186),
('e0000000-0000-0000-0000-000000000004', 'Karim Ouhajjou', '0655443322', 259),
('e0000000-0000-0000-0000-000000000005', 'Fatima Zahra Lahlou', '0622334455', 612),
('e0000000-0000-0000-0000-000000000006', 'Mohamed Amine Rafik', '0644556677', 145),
('e0000000-0000-0000-0000-000000000007', 'Aicha Belkadi', '0666778899', 823),
('e0000000-0000-0000-0000-000000000008', 'Hassan Ouazzani', '0688990011', 97),
('e0000000-0000-0000-0000-000000000009', 'Khadija El Mouden', '0611223344', 354),
('e0000000-0000-0000-0000-000000000010', 'Rachid Benjelloun', '0633445566', 507),
('e0000000-0000-0000-0000-000000000011', 'Mariam Tazi', '0655667788', 221),
('e0000000-0000-0000-0000-000000000012', 'Omar Filali', '0677889900', 678),
('e0000000-0000-0000-0000-000000000013', 'Sanae El Fassi', '0699001122', 432),
('e0000000-0000-0000-0000-000000000014', 'Hicham Berrada', '0610111213', 189),
('e0000000-0000-0000-0000-000000000015', 'Sara Benabdelkader', '0614151617', 745),
('e0000000-0000-0000-0000-000000000016', 'Anas El Haddad', '0618192021', 312),
('e0000000-0000-0000-0000-000000000017', 'Imane Kabbaj', '0622232425', 560),
('e0000000-0000-0000-0000-000000000018', 'Driss Amrani', '0626272829', 113),
('e0000000-0000-0000-0000-000000000019', 'Laila Bennis', '0630313233', 894),
('e0000000-0000-0000-0000-000000000020', 'Adil Sekkat', '0634353637', 276)
on conflict (id) do nothing;

insert into ventes (id, produit_id, quantite, total, date, client_id) values
('f0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 2, 298, '2026-06-10T09:15:00.000Z', 'e0000000-0000-0000-0000-000000000001'),
('f0000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000007', 1, 499, '2026-06-10T11:30:00.000Z', 'e0000000-0000-0000-0000-000000000002'),
('f0000000-0000-0000-0000-000000000003', '60000000-0000-0000-0000-000000000010', 2, 174, '2026-06-09T15:45:00.000Z', 'e0000000-0000-0000-0000-000000000003')
on conflict (id) do nothing;
