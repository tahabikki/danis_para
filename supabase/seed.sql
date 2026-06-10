insert into produits (id, nom, description, prix, stock, image_url, categorie) values
('11111111-1111-1111-1111-111111111111', 'Crème hydratante apaisante', 'Soin quotidien pour peaux sensibles avec effet confort immédiat.', 149, 18, '/products/creme-hydratante.jpeg', 'DERMOCOSMÉTIQUE'),
('22222222-2222-2222-2222-222222222222', 'Sérum éclat vitamine C', 'Concentré illuminateur pour uniformiser le teint et réduire la fatigue cutanée.', 229, 12, '/products/serum-vitamine-c.jpeg', 'DERMOCOSMÉTIQUE'),
('33333333-3333-3333-3333-333333333333', 'Magnésium marin + B6', 'Complément pour la vitalité, la gestion du stress et le bon fonctionnement musculaire.', 119, 34, '/products/magnesium.jpeg', 'COMPLÉMENT ALIMENTAIRE'),
('44444444-4444-4444-4444-444444444444', 'Oméga 3 premium', 'Capsules riches en acides gras essentiels pour le bien-être cardiovasculaire.', 189, 22, '/products/omega3.jpeg', 'COMPLÉMENT ALIMENTAIRE'),
('55555555-5555-5555-5555-555555555555', 'Huile essentielle lavande', 'Solution aromatique relaxante adaptée à la diffusion et aux routines bien-être.', 89, 15, '/products/lavande.jpeg', 'PHYTO-AROMATHÉRAPIE'),
('66666666-6666-6666-6666-666666666666', 'Gel chauffant articulation', 'Gel de massage pour soulager les zones de tension et les inconforts articulaires.', 134, 9, '/products/gel-articulation.jpeg', 'ORTHOPÉDIE'),
('77777777-7777-7777-7777-777777777777', 'Tensiomètre digital bras', 'Appareil simple et fiable pour la surveillance quotidienne de la tension à domicile.', 499, 7, '/products/tensiometre.jpeg', 'MATÉRIEL MÉDICAL'),
('88888888-8888-8888-8888-888888888888', 'Thermomètre infrarouge', 'Mesure rapide et précise pour toute la famille, sans contact.', 279, 11, '/products/thermometre.jpeg', 'MATÉRIEL MÉDICAL'),
('99999999-9999-9999-9999-999999999999', 'Lait de toilette bébé', 'Nettoie et protège la peau délicate des nourrissons sans dessécher.', 98, 21, '/products/lait-bebe.jpeg', 'ESPACE BÉBÉ & MAMAN'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Crème change protectrice', 'Apaise les rougeurs et forme une barrière protectrice durable.', 87, 16, '/products/creme-change.jpeg', 'ESPACE BÉBÉ & MAMAN'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Ceinture lombaire confort', 'Maintien léger pour accompagner les activités quotidiennes et le dos sensible.', 259, 6, '/products/ceinture-lombaire.jpeg', 'ORTHOPÉDIE'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Infusion digestion légère', 'Mélange de plantes aux notes douces pour accompagner les repas copieux.', 64, 27, '/products/infusion-digestion.jpeg', 'PHYTO-AROMATHÉRAPIE');

insert into clients (id, nom, telephone, total_achats) values
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Salma El Idrissi', '0612345678', 378),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Youssef Ait Ali', '0667891234', 499),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Nadia Bennani', '0677001122', 186),
('12121212-1212-1212-1212-121212121212', 'Karim Ouhajjou', '0655443322', 259);

insert into ventes (id, produit_id, quantite, total, date, client_id) values
('13131313-1313-1313-1313-131313131313', '11111111-1111-1111-1111-111111111111', 2, 298, '2026-06-10T09:15:00.000Z', 'dddddddd-dddd-dddd-dddd-dddddddddddd'),
('14141414-1414-1414-1414-141414141414', '77777777-7777-7777-7777-777777777777', 1, 499, '2026-06-10T11:30:00.000Z', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'),
('15151515-1515-1515-1515-151515151515', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 2, 174, '2026-06-09T15:45:00.000Z', 'ffffffff-ffff-ffff-ffff-ffffffffffff');
