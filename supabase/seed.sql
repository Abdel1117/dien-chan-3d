-- Test data. ENTIRELY FICTITIOUS: not real Dien Chan points, positions or
-- indications. Positions are arbitrary values near the provisional head.

insert into public.points (id, numero, pos_x, pos_y, pos_z, normal_x, normal_y, normal_z, model_version)
values
  ('00000000-0000-4000-8000-000000000001', 'T1',  0.00,  0.28, 0.30975, -0.0271, 0.3609, 0.9322, 'head-v1'),
  ('00000000-0000-4000-8000-000000000002', 'T2',  0.13, -0.07, 0.23497, 0.8340, -0.2163, 0.5077, 'head-v1'),
  ('00000000-0000-4000-8000-000000000003', 'T3', -0.13, -0.07, 0.23497, -0.8340, -0.2163, 0.5077, 'head-v1');

insert into public.points_traductions (point_id, locale, nom, zone, description)
values
  ('00000000-0000-4000-8000-000000000001', 'fr', 'Point test 1', 'Zone test', 'Point fictif pour les tests.'),
  ('00000000-0000-4000-8000-000000000001', 'en', 'Test point 1', 'Test zone', 'Fictitious point for testing.'),
  ('00000000-0000-4000-8000-000000000001', 'vi', 'Điểm thử 1', 'Vùng thử', 'Điểm giả lập để kiểm thử.'),
  ('00000000-0000-4000-8000-000000000002', 'fr', 'Point test 2', 'Zone test', 'Point fictif pour les tests.'),
  ('00000000-0000-4000-8000-000000000002', 'en', 'Test point 2', 'Test zone', 'Fictitious point for testing.'),
  ('00000000-0000-4000-8000-000000000003', 'fr', 'Point test 3', 'Zone test', 'Point fictif pour les tests.'),
  ('00000000-0000-4000-8000-000000000003', 'en', 'Test point 3', 'Test zone', 'Fictitious point for testing.');

insert into public.parcours (id, slug, categorie, tours, duree_defaut_secondes, publie)
values
  ('00000000-0000-4000-8000-0000000000a1', 'parcours-de-demonstration', 'douleur', 2, 30, true),
  ('00000000-0000-4000-8000-0000000000a2', 'brouillon-de-demonstration', 'trouble', 1, 30, false);

insert into public.parcours_traductions (parcours_id, locale, titre, description, avertissement)
values
  ('00000000-0000-4000-8000-0000000000a1', 'fr', 'Parcours de démonstration', 'Parcours fictif pour tester le lecteur.', 'Le Dien Chan est une pratique complémentaire qui ne remplace pas un avis médical.'),
  ('00000000-0000-4000-8000-0000000000a1', 'en', 'Demonstration routine', 'Fictitious routine to test the player.', 'Dien Chan is a complementary practice that does not replace medical advice.'),
  ('00000000-0000-4000-8000-0000000000a1', 'vi', 'Liệu trình mẫu', 'Liệu trình giả lập để thử trình phát.', 'Diện Chẩn là phương pháp bổ trợ, không thay thế lời khuyên của bác sĩ.'),
  ('00000000-0000-4000-8000-0000000000a2', 'fr', 'Brouillon de démonstration', 'Non publié : invisible pour les visiteurs.', null);

insert into public.parcours_etapes (id, parcours_id, point_id, ordre, cote, mode_dosage, duree_secondes, repetitions, cadence_par_minute, technique, outil, pause_apres_secondes)
values
  ('00000000-0000-4000-8000-0000000000b1', '00000000-0000-4000-8000-0000000000a1', '00000000-0000-4000-8000-000000000001', 0, 'central', 'duree',       30,   null, null, 'pression', 'doigt', 5),
  ('00000000-0000-4000-8000-0000000000b2', '00000000-0000-4000-8000-0000000000a1', '00000000-0000-4000-8000-000000000002', 1, 'gauche',  'repetitions', null, 20,   60,   'pression', 'doigt', 5),
  ('00000000-0000-4000-8000-0000000000b3', '00000000-0000-4000-8000-0000000000a1', '00000000-0000-4000-8000-000000000003', 2, 'droite',  'duree',       30,   null, null, 'massage',  'doigt', 0);

insert into public.etapes_traductions (etape_id, locale, note)
values
  ('00000000-0000-4000-8000-0000000000b1', 'fr', 'Étape fictive.'),
  ('00000000-0000-4000-8000-0000000000b1', 'en', 'Fictitious step.');
