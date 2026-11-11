-- Real routine: "Bộ thăng" (Bùi Quốc Châu), points 127 50 19 37 1 73 189 103 300 0.
-- Positions are approximations computed on head-v1 from published location
-- descriptions. CHECK EACH ONE against a reference chart in the point editor.
-- Bilateral points (73, 300, 0) are stored on the person's left side; the app
-- mirrors them when the step's side is 'les_deux'.

begin;

insert into public.points (id, numero, pos_x, pos_y, pos_z, normal_x, normal_y, normal_z, model_version) values
  ('00000000-0000-4000-8000-000000000100', '127', 0.0, -0.112, 0.30792, -0.0024, -0.3584, 0.9336, 'head-v1'),
  ('00000000-0000-4000-8000-000000000101', '50', -0.097, 0.028, 0.28021, -0.4191, -0.0148, 0.9078, 'head-v1'),
  ('00000000-0000-4000-8000-000000000102', '19', 0.0, 0.0, 0.33376, -0.031, -0.0394, 0.9987, 'head-v1'),
  ('00000000-0000-4000-8000-000000000103', '37', 0.097, 0.028, 0.28021, 0.4191, -0.0148, 0.9078, 'head-v1'),
  ('00000000-0000-4000-8000-000000000104', '1', 0.0, 0.085, 0.37166, -0.1963, 0.507, 0.8393, 'head-v1'),
  ('00000000-0000-4000-8000-000000000105', '73', 0.097, 0.126, 0.26395, 0.1166, 0.3309, 0.9364, 'head-v1'),
  ('00000000-0000-4000-8000-000000000106', '189', 0.0, 0.126, 0.34493, -0.2042, 0.5169, 0.8313, 'head-v1'),
  ('00000000-0000-4000-8000-000000000107', '103', 0.0, 0.28, 0.30975, -0.0271, 0.3609, 0.9322, 'head-v1'),
  ('00000000-0000-4000-8000-000000000108', '300', 0.07, 0.335, 0.2712, 0.3342, 0.4381, 0.8345, 'head-v1'),
  ('00000000-0000-4000-8000-000000000109', '0', 0.22883, 0.1, 0.038, 0.9771, 0.1418, 0.1587, 'head-v1');

insert into public.points_traductions (point_id, locale, nom) values
  ('00000000-0000-4000-8000-000000000100', 'fr', 'Creux du menton'),
  ('00000000-0000-4000-8000-000000000100', 'en', 'Chin hollow'),
  ('00000000-0000-4000-8000-000000000100', 'vi', 'Chỗ lõm ụ cằm'),
  ('00000000-0000-4000-8000-000000000101', 'fr', 'Joue droite, au niveau de l''aile du nez'),
  ('00000000-0000-4000-8000-000000000101', 'en', 'Right cheek, level with the nostril'),
  ('00000000-0000-4000-8000-000000000101', 'vi', 'Má phải, ngang cánh mũi'),
  ('00000000-0000-4000-8000-000000000102', 'fr', 'Haut du sillon sous le nez'),
  ('00000000-0000-4000-8000-000000000102', 'en', 'Top of the philtrum'),
  ('00000000-0000-4000-8000-000000000102', 'vi', 'Điểm cao nhất của rãnh nhân trung'),
  ('00000000-0000-4000-8000-000000000103', 'fr', 'Joue gauche, au niveau de l''aile du nez'),
  ('00000000-0000-4000-8000-000000000103', 'en', 'Left cheek, level with the nostril'),
  ('00000000-0000-4000-8000-000000000103', 'vi', 'Má trái, ngang cánh mũi'),
  ('00000000-0000-4000-8000-000000000104', 'fr', 'Milieu de l''arête du nez'),
  ('00000000-0000-4000-8000-000000000104', 'en', 'Middle of the nose bridge'),
  ('00000000-0000-4000-8000-000000000104', 'vi', 'Giữa sống mũi'),
  ('00000000-0000-4000-8000-000000000105', 'fr', 'Sous l''œil, sur le bord de l''orbite'),
  ('00000000-0000-4000-8000-000000000105', 'en', 'Below the eye, on the orbital rim'),
  ('00000000-0000-4000-8000-000000000105', 'vi', 'Dưới mắt, bờ dưới hốc mắt'),
  ('00000000-0000-4000-8000-000000000106', 'fr', 'Haut de l''arête du nez, entre les yeux'),
  ('00000000-0000-4000-8000-000000000106', 'en', 'Top of the nose bridge, between the eyes'),
  ('00000000-0000-4000-8000-000000000106', 'vi', 'Đỉnh sống mũi, giữa hai mắt'),
  ('00000000-0000-4000-8000-000000000107', 'fr', 'Milieu du front'),
  ('00000000-0000-4000-8000-000000000107', 'en', 'Centre of the forehead'),
  ('00000000-0000-4000-8000-000000000107', 'vi', 'Chính giữa trán'),
  ('00000000-0000-4000-8000-000000000108', 'fr', 'Haut du front'),
  ('00000000-0000-4000-8000-000000000108', 'en', 'Upper forehead'),
  ('00000000-0000-4000-8000-000000000108', 'vi', 'Phần trên trán'),
  ('00000000-0000-4000-8000-000000000109', 'fr', 'Devant l''oreille, au bord du tragus'),
  ('00000000-0000-4000-8000-000000000109', 'en', 'In front of the ear, at the edge of the tragus'),
  ('00000000-0000-4000-8000-000000000109', 'vi', 'Trước tai, sát bình tai');

insert into public.parcours (id, slug, categorie, tours, duree_defaut_secondes, publie) values
  ('00000000-0000-4000-8000-0000000000c1', 'bo-thang', 'trouble', 1, 30, true);

insert into public.parcours_traductions (parcours_id, locale, titre, description, avertissement) values
  ('00000000-0000-4000-8000-0000000000c1', 'fr', 'Bộ thăng — formule tonifiante de base', 'Formule classique du Diện Chẩn (Bùi Quốc Châu), utilisée traditionnellement pour tonifier et réchauffer l''organisme. Stimulez les points dans l''ordre, de bas en haut.', 'Pratique complémentaire qui ne remplace pas un avis médical. Formule traditionnellement déconseillée en cas d''hypertension, de fièvre ou d''infection, d''ulcère, et pendant la grossesse. En cas de doute, demandez l''avis d''un professionnel de santé.'),
  ('00000000-0000-4000-8000-0000000000c1', 'en', 'Bộ thăng — basic tonifying formula', 'A classic Diện Chẩn formula (Bùi Quốc Châu), traditionally used to tonify and warm the body. Stimulate the points in order, from bottom to top.', 'A complementary practice that does not replace medical advice. Traditionally not advised with high blood pressure, fever or infection, ulcers, or during pregnancy. If in doubt, ask a health professional.'),
  ('00000000-0000-4000-8000-0000000000c1', 'vi', 'Bộ thăng — phác đồ bổ dương khí', 'Phác đồ kinh điển của Diện Chẩn (Bùi Quốc Châu), thường dùng để bổ khí và làm ấm cơ thể. Tác động các huyệt theo thứ tự, từ dưới lên trên.', 'Phương pháp bổ trợ, không thay thế lời khuyên của bác sĩ. Theo truyền thống không nên dùng khi bị cao huyết áp, sốt hoặc nhiễm trùng, loét, và khi mang thai. Nếu không chắc chắn, hãy hỏi ý kiến chuyên gia y tế.');

insert into public.parcours_etapes (id, parcours_id, point_id, ordre, cote, mode_dosage, duree_secondes, technique, outil, pause_apres_secondes) values
  ('00000000-0000-4000-8000-000000000200', '00000000-0000-4000-8000-0000000000c1', '00000000-0000-4000-8000-000000000100', 0, 'central', 'duree', 30, 'pression', 'doigt', 5),
  ('00000000-0000-4000-8000-000000000201', '00000000-0000-4000-8000-0000000000c1', '00000000-0000-4000-8000-000000000101', 1, 'droite', 'duree', 30, 'pression', 'doigt', 5),
  ('00000000-0000-4000-8000-000000000202', '00000000-0000-4000-8000-0000000000c1', '00000000-0000-4000-8000-000000000102', 2, 'central', 'duree', 30, 'pression', 'doigt', 5),
  ('00000000-0000-4000-8000-000000000203', '00000000-0000-4000-8000-0000000000c1', '00000000-0000-4000-8000-000000000103', 3, 'gauche', 'duree', 30, 'pression', 'doigt', 5),
  ('00000000-0000-4000-8000-000000000204', '00000000-0000-4000-8000-0000000000c1', '00000000-0000-4000-8000-000000000104', 4, 'central', 'duree', 30, 'pression', 'doigt', 5),
  ('00000000-0000-4000-8000-000000000205', '00000000-0000-4000-8000-0000000000c1', '00000000-0000-4000-8000-000000000105', 5, 'les_deux', 'duree', 30, 'pression', 'doigt', 5),
  ('00000000-0000-4000-8000-000000000206', '00000000-0000-4000-8000-0000000000c1', '00000000-0000-4000-8000-000000000106', 6, 'central', 'duree', 30, 'pression', 'doigt', 5),
  ('00000000-0000-4000-8000-000000000207', '00000000-0000-4000-8000-0000000000c1', '00000000-0000-4000-8000-000000000107', 7, 'central', 'duree', 30, 'pression', 'doigt', 5),
  ('00000000-0000-4000-8000-000000000208', '00000000-0000-4000-8000-0000000000c1', '00000000-0000-4000-8000-000000000108', 8, 'les_deux', 'duree', 30, 'pression', 'doigt', 5),
  ('00000000-0000-4000-8000-000000000209', '00000000-0000-4000-8000-0000000000c1', '00000000-0000-4000-8000-000000000109', 9, 'les_deux', 'duree', 30, 'pression', 'doigt', 5);

commit;
