import React, { createContext, useContext, useState, useEffect } from 'react';

const baseKeys = {
  home: { ar: 'الرئيسية', en: 'Home', fr: 'Accueil', de: 'Startseite', es: 'Inicio', it: 'Home', zh: '主页', ja: 'ホーム', tr: 'Ana Sayfa' },
  explore: { ar: 'استكشف', en: 'Explore', fr: 'Explorer', de: 'Erkunden', es: 'Explorar', it: 'Esplora', zh: '探索', ja: '探索', tr: 'Keşfet' },
  map: { ar: 'الخريطة', en: 'Map', fr: 'Carte', de: 'Karte', es: 'Mapa', it: 'Mappa', zh: '地图', ja: '地図', tr: 'Harita' },
  search: { ar: 'البحث', en: 'Search', fr: 'Recherche', de: 'Suche', es: 'Buscar', it: 'Cerca', zh: '搜索', ja: '検索', tr: 'Arama' },
  askAI: { ar: 'اسأل الذكاء الاصطناعي', en: 'Ask AI', fr: "Demander à l'IA", de: 'KI fragen', es: 'Preguntar IA', it: 'Chiedi IA', zh: '问AI', ja: 'AIに聞く', tr: 'AI\'a Sor' },
  admin: { ar: 'لوحة التحكم', en: 'Admin Panel', fr: 'Panneau Admin', de: 'Adminbereich', es: 'Panel Admin', it: 'Pannello Admin', zh: '管理面板', ja: '管理パネル', tr: 'Yönetim Paneli' },
  places: { ar: 'الأماكن', en: 'Places', fr: 'Lieux', de: 'Orte', es: 'Lugares', it: 'Luoghi', zh: '地点', ja: '場所', tr: 'Yerler' },
  profile: { ar: 'الملف الشخصي', en: 'Profile', fr: 'Profil', de: 'Profil', es: 'Perfil', it: 'Profilo', zh: '个人资料', ja: 'プロフィール', tr: 'Profil' },
  settings: { ar: 'الإعدادات', en: 'Settings', fr: 'Paramètres', de: 'Einstellungen', es: 'Configuración', it: 'Impostazioni', zh: '设置', ja: '設定', tr: 'Ayarlar' },
  darkMode: { ar: 'الوضع الداكن', en: 'Dark Mode', fr: 'Mode Sombre', de: 'Dunkelmodus', es: 'Modo Oscuro', it: 'Modalità Scura', zh: '深色模式', ja: 'ダークモード', tr: 'Karanlık Mod' },
  lightMode: { ar: 'الوضع الفاتح', en: 'Light Mode', fr: 'Mode Clair', de: 'Hellmodus', es: 'Modo Claro', it: 'Modalità Chiara', zh: '浅色模式', ja: 'ライトモード', tr: 'Açık Mod' },
  language: { ar: 'اللغة', en: 'Language', fr: 'Langue', de: 'Sprache', es: 'Idioma', it: 'Lingua', zh: '语言', ja: '言語', tr: 'Dil' },
  wondersOfEgypt: { ar: 'عجائب مصر', en: 'Wonders of Egypt', fr: "Merveilles d'Égypte", de: 'Wunder Ägyptens', es: 'Maravillas de Egipto', it: "Meraviglie dell'Egitto", zh: '埃及奇迹', ja: 'エジプトの不思議', tr: "Mısır'ın Harikaları" },
  discoverEgypt: { ar: 'اكتشف جمال مصر الخفي', en: 'Discover the Hidden Beauty of Egypt', fr: "Découvrez la beauté cachée de l'Égypte", de: 'Entdecken Sie die verborgene Schönheit Ägyptens', es: 'Descubra la belleza oculta de Egipto', it: "Scopri la bellezza nascosta dell'Egitto", zh: '发现埃及隐藏的美丽', ja: 'エジプトの隠れた美しさを発見', tr: "Mısır'ın Gizli Güzelliğini Keşfedin" },
  more: { ar: 'المزيد', en: 'More', fr: 'Plus', de: 'Mehr', es: 'Más', it: 'Altro', zh: '更多', ja: 'もっと', tr: 'Daha fazla' },
  main: { ar: 'الرئيسي', en: 'Main', fr: 'Principal', de: 'Haupt', es: 'Principal', it: 'Principale', zh: '主要', ja: 'メイン', tr: 'Ana' },
  exploreAllFeatures: { ar: 'استكشف كل الميزات', en: 'Explore All Features', fr: 'Explorez toutes les fonctionnalités', de: 'Alle Funktionen entdecken', es: 'Explora todas las funciones', it: 'Esplora tutte le funzionalità', zh: '探索所有功能', ja: 'すべての機能を探索', tr: 'Tüm Özellikleri Keşfet' },
  liveAiGuide: { ar: 'LIVE · AI مدعوم بمصر', en: 'LIVE · AI-POWERED EGYPT GUIDE', fr: 'EN DIRECT · GUIDE ÉGYPTE IA', de: 'LIVE · KI-UNTERSTÜTZTER ÄGYPTEN-FÜHRER', es: 'EN VIVO · GUÍA EGIPTO IA', it: 'LIVE · GUIDA EGITTO IA', zh: '直播 · AI 驱动的埃及指南', ja: 'ライブ · AI対応エジプトガイド', tr: 'CANLI · AI DESTEKLİ MISIR REHBERİ' },
  heroHeading1: { ar: 'اكتشف', en: 'Discover', fr: 'Découvrez', de: 'Entdecken', es: 'Descubre', it: 'Scopri', zh: '发现', ja: '発見', tr: 'Keşfet' },
  heroHeading2: { ar: 'عجائب مصر', en: 'Egypt Wonders', fr: 'Merveilles d'Égypte', de: 'Wunder Ägyptens', es: 'Maravillas de Egipto', it: 'Meraviglie dell\'Egitto', zh: '埃及奇迹', ja: 'エジプトの不思議', tr: 'Mısır Harikaları' },
  heroTagline: { ar: 'بوابتك الذكية لاستكشاف كنوز مصر الخالدة عبر 14 ميزة AI', en: 'Your smart gateway to Egypt’s hidden treasures with 14 AI features', fr: 'Votre passerelle intelligente vers les trésors de l\'Égypte avec 14 fonctionnalités IA', de: 'Ihr intelligentes Tor zu Ägyptens verborgenen Schätzen mit 14 KI-Funktionen', es: 'Tu puerta inteligente a los tesoros de Egipto con 14 funciones de IA', it: 'La tua porta intelligente ai tesori dell\'Egitto con 14 funzionalità IA', zh: '通过14个AI功能，智能探索埃及隐藏宝藏', ja: '14のAI機能でエジプトの隠れた宝をスマートに発見', tr: '14 AI özelliği ile Mısır’ın gizli hazinelerini akıllıca keşfedin' },
  startExploring: { ar: 'ابدأ الاستكشاف', en: 'Start Exploring', fr: 'Commencez à explorer', de: 'Beginnen Sie mit der Erkundung', es: 'Comienza a explorar', it: 'Inizia a esplorare', zh: '开始探索', ja: '探索を始める', tr: 'Keşfetmeye Başla' },
  askAiFree: { ar: 'اسأل AI مجاناً', en: 'Ask AI Free', fr: 'Demandez à l\'IA gratuitement', de: 'Fragen Sie KI kostenlos', es: 'Pregunta gratis a IA', it: 'Chiedi all\'IA gratis', zh: '免费询问AI', ja: 'AIに無料で質問', tr: 'AI'ya Ücretsiz Sor' },
  travelPersonality: { ar: 'شخصيتك كمسافر', en: 'Your Travel Personality', fr: 'Votre personnalité de voyage', de: 'Ihre Reisepersönlichkeit', es: 'Tu personalidad viajera', it: 'La tua personalità di viaggio', zh: '你的旅行个性', ja: 'あなたの旅行パーソナリティ', tr: 'Seyahat Kişiliğiniz' },
  heroTag1: { ar: '14+ ميزة', en: '14+ features', fr: '14+ fonctionnalités', de: '14+ Funktionen', es: '14+ funciones', it: '14+ funzionalità', zh: '14+ 功能', ja: '14以上の機能', tr: '14+ özellik' },
  heroTag2: { ar: 'AI مدمج', en: 'Built-in AI', fr: 'IA intégrée', de: 'Integrierte KI', es: 'IA integrada', it: 'IA integrata', zh: '内置AI', ja: '組み込みAI', tr: 'Dahili AI' },
  heroTag3: { ar: 'محدّث لحظياً', en: 'Live updated', fr: 'Mis à jour en direct', de: 'Live aktualisiert', es: 'Actualizado en vivo', it: 'Aggiornato in tempo reale', zh: '实时更新', ja: 'ライブ更新', tr: 'Canlı güncelleniyor' },
  heroTag4: { ar: '3 مساعدين ذكيين', en: '3 smart guides', fr: '3 assistants intelligents', de: '3 intelligente Assistenten', es: '3 guías inteligentes', it: '3 assistenti intelligenti', zh: '3 个智能助手', ja: '3つのスマートガイド', tr: '3 akıllı yardımcı' },
  quickLinks: { ar: 'روابط سريعة', en: 'Quick links', fr: 'Liens rapides', de: 'Schnellzugriff', es: 'Enlaces rápidos', it: 'Link veloci', zh: '快速链接', ja: 'クイックリンク', tr: 'Hızlı bağlantılar' },
  teamContact: { ar: 'الفريق والتواصل', en: 'Team & contact', fr: 'Équipe et contact', de: 'Team & Kontakt', es: 'Equipo y contacto', it: 'Squadra e contatto', zh: '团队与联系', ja: 'チームと連絡先', tr: 'Ekip ve iletişim' },
  madeWithPassion: { ar: 'مصنوع بشغف', en: 'Made with passion', fr: 'Fait avec passion', de: 'Mit Leidenschaft gemacht', es: 'Hecho con pasión', it: 'Realizzato con passione', zh: '充满热情制作', ja: '情熱を込めて作成', tr: 'Tutkuyla yapıldı' },
  competition: { ar: 'مسابقة 2026', en: 'Competition 2026', fr: 'Compétition 2026', de: 'Wettbewerb 2026', es: 'Competencia 2026', it: 'Competizione 2026', zh: '2026 年比赛', ja: '2026年コンペ', tr: 'Yarışma 2026' },
  searchDatabase: { ar: 'قاعدة البيانات', en: 'Database', fr: 'Base de données', de: 'Datenbank', es: 'Base de datos', it: 'Database', zh: '数据库', ja: 'データベース', tr: 'Veritabanı' },
  searchWikipediaTab: { ar: 'ويكيبيديا', en: 'Wikipedia', fr: 'Wikipedia', de: 'Wikipedia', es: 'Wikipedia', it: 'Wikipedia', zh: '维基百科', ja: 'ウィキペディア', tr: 'Vikipedi' },
  add: { ar: 'إضافة', en: 'Add', fr: 'Ajouter', de: 'Hinzufügen', es: 'Agregar', it: 'Aggiungi', zh: '添加', ja: '追加', tr: 'Ekle' },
  searchMaps: { ar: 'ابحث في الخرائط', en: 'Search in maps', fr: 'Rechercher dans les cartes', de: 'In Karten suchen', es: 'Buscar en mapas', it: 'Cerca nelle mappe', zh: '在地图中搜索', ja: '地図で検索', tr: 'Haritalarda ara' },
  hideResults: { ar: 'إخفاء النتائج', en: 'Hide results', fr: 'Masquer les résultats', de: 'Ergebnisse ausblenden', es: 'Ocultar resultados', it: 'Nascondi risultati', zh: '隐藏结果', ja: '結果を隠す', tr: 'Sonuçları gizle' },
  exploreHeader: { ar: 'اكتشف كنوز مصر', en: 'Discover Egypt’s treasures', fr: 'Découvrez les trésors d\'Égypte', de: 'Entdecken Sie die Schätze Ägyptens', es: 'Descubre los tesoros de Egipto', it: 'Scopri i tesori dell\'Egitto', zh: '发现埃及的宝藏', ja: 'エジプトの宝を発見', tr: 'Mısır’ın hazinelerini keşfedin' },
  exploreSubheader: { ar: 'أماكن تاريخية · طبيعية · ثقافية موثقة ومكتشفة', en: 'Historic · natural · cultural spots documented and discovered', fr: 'Sites historiques · naturels · culturels documentés et découverts', de: 'Historische · natürliche · kulturelle Orte dokumentiert und entdeckt', es: 'Lugares históricos · naturales · culturales documentados y descubiertos', it: 'Luoghi storici · naturali · culturali documentati e scoperti', zh: '历史 · 自然 · 文化地点记录与发现', ja: '歴史的·自然·文化スポットを記録・発見', tr: 'Tarihi · doğal · kültürel yerler belgelendi ve keşfedildi' },
  noPlaces: { ar: 'لا توجد أماكن', en: 'No places found', fr: 'Aucun lieu trouvé', de: 'Keine Orte gefunden', es: 'No se encontraron lugares', it: 'Nessun luogo trovato', zh: '未找到地点', ja: '場所が見つかりません', tr: 'Yer bulunamadı' },
  placeCountLabel: { ar: 'مكان', en: 'place', fr: 'lieu', de: 'Ort', es: 'lugar', it: 'luogo', zh: '地点', ja: '場所', tr: 'yer' },
  categoryLabel: { ar: 'تصفح حسب النوع', en: 'Browse by category', fr: 'Parcourir par catégorie', de: 'Nach Kategorie durchsuchen', es: 'Buscar por categoría', it: 'Esplora per categoria', zh: '按类别浏览', ja: 'カテゴリ別に閲覧', tr: 'Kategoriye göre gözat' },
  hideResults: { ar: 'إخفاء النتائج', en: 'Hide results', fr: 'Masquer les résultats', de: 'Ergebnisse ausblenden', es: 'Ocultar resultados', it: 'Nascondi risultati', zh: '隐藏结果', ja: '結果を隠す', tr: 'Sonuçları gizle' },
  liveFeed: { ar: 'آخر التحديثات', en: 'Live feed', fr: 'Fil en direct', de: 'Live-Feed', es: 'Feed en vivo', it: 'Feed dal vivo', zh: '实时动态', ja: 'ライブフィード', tr: 'Canlı akış' },
  readMore: { ar: 'اقرأ المزيد', en: 'Read more', fr: 'Lire la suite', de: 'Weiterlesen', es: 'Leer más', it: 'Leggi di più', zh: '阅读更多', ja: '続きを読む', tr: 'Daha fazla oku' },
  dailyAiTip: { ar: 'نصيحة AI اليوم', en: 'Today’s AI tip', fr: 'Conseil IA du jour', de: 'KI-Tipp des Tages', es: 'Consejo de IA del día', it: 'Consiglio IA del giorno', zh: '今日AI提示', ja: '本日のAIヒント', tr: 'Bugünün AI ipucu' },
  travelIntelligence: { ar: 'منصة سياحية ذكية تجمع بين تخطيط الرحلات، المحتوى المحلي، وذكاء اصطناعي متقدم لتجربة مصرية غنية.', en: 'Smart travel platform combining trip planning, local content, and advanced AI for a rich Egypt experience.', fr: 'Plateforme de voyage intelligente combinant planification de voyage, contenu local et IA avancée pour une expérience égyptienne riche.', de: 'Intelligente Reiseplattform, die Reiseplanung, lokale Inhalte und fortschrittliche KI für ein reichhaltiges Ägypten-Erlebnis kombiniert.', es: 'Plataforma de viaje inteligente que combina planificación de viajes, contenido local e IA avanzada para una rica experiencia en Egipto.', it: 'Piattaforma di viaggio intelligente che combina pianificazione di viaggi, contenuti locali e IA avanzata per un’esperienza egiziana ricca.', zh: '智能旅行平台结合行程规划、本地内容和先进AI，为您提供丰富的埃及体验。', ja: '旅行計画、ローカルコンテンツ、高度なAIを組み合わせた賢い旅行プラットフォームで、豊かなエジプト体験を提供します。', tr: 'Gezinizi planlama, yerel içerik ve gelişmiş AI’yi zengin bir Mısır deneyimi için birleştiren akıllı seyahat platformu.' },
  contactTeam: { ar: 'تواصل مع الفريق', en: 'Contact the team', fr: 'Contactez l\'équipe', de: 'Kontaktieren Sie das Team', es: 'Contacta con el equipo', it: 'Contatta il team', zh: '联系团队', ja: 'チームに連絡', tr: 'Takımla iletişime geç' },
  quickLinks: { ar: 'روابط سريعة', en: 'Quick links', fr: 'Liens rapides', de: 'Schnellzugriff', es: 'Enlaces rápidos', it: 'Link veloci', zh: '快速链接', ja: 'クイックリンク', tr: 'Hızlı bağlantılar' },
  teamContact: { ar: 'الفريق والتواصل', en: 'Team & contact', fr: 'Équipe et contact', de: 'Team & Kontakt', es: 'Equipo y contacto', it: 'Squadra e contatto', zh: '团队与联系', ja: 'チームと連絡先', tr: 'Ekip ve iletişim' },
  askQuestion: { ar: 'اسأل سؤالاً عن أي مكان في مصر...', en: 'Ask about any place in Egypt...', fr: "Posez une question sur l'Égypte...", de: 'Fragen Sie über Ägypten...', es: 'Pregunta sobre Egipto...', it: "Chiedi sull'Egitto...", zh: '询问埃及任何地方...', ja: 'エジプトについて質問...', tr: "Mısır'daki herhangi bir yer hakkında sorun..." },
  send: { ar: 'إرسال', en: 'Send', fr: 'Envoyer', de: 'Senden', es: 'Enviar', it: 'Invia', zh: '发送', ja: '送信', tr: 'Gönder' },
  loading: { ar: 'جاري التحميل...', en: 'Loading...', fr: 'Chargement...', de: 'Laden...', es: 'Cargando...', it: 'Caricamento...', zh: '加载中...', ja: '読み込み中...', tr: 'Yükleniyor...' },
  noResults: { ar: 'لا توجد نتائج', en: 'No results found', fr: 'Aucun résultat', de: 'Keine Ergebnisse', es: 'Sin resultados', it: 'Nessun risultato', zh: '没有结果', ja: '結果なし', tr: 'Sonuç bulunamadı' },
  viewDetails: { ar: 'عرض التفاصيل', en: 'View Details', fr: 'Voir les détails', de: 'Details anzeigen', es: 'Ver detalles', it: 'Visualizza dettagli', zh: '查看详情', ja: '詳細を見る', tr: 'Detayları Gör' },
  category: { ar: 'التصنيف', en: 'Category', fr: 'Catégorie', de: 'Kategorie', es: 'Categoría', it: 'Categoria', zh: '类别', ja: 'カテゴリ', tr: 'Kategori' },
  archaeological: { ar: 'أثري', en: 'Archaeological', fr: 'Archéologique', de: 'Archäologisch', es: 'Arqueológico', it: 'Archeologico', zh: '考古学', ja: '考古学的', tr: 'Arkeolojik' },
  natural: { ar: 'طبيعي', en: 'Natural', fr: 'Naturel', de: 'Natürlich', es: 'Natural', it: 'Naturale', zh: '自然', ja: '自然', tr: 'Doğal' },
  historical: { ar: 'تاريخي', en: 'Historical', fr: 'Historique', de: 'Historisch', es: 'Histórico', it: 'Storico', zh: '历史', ja: '歴史的', tr: 'Tarihi' },
  religious: { ar: 'ديني', en: 'Religious', fr: 'Religieux', de: 'Religiös', es: 'Religioso', it: 'Religioso', zh: '宗教', ja: '宗教的', tr: 'Dini' },
  cultural: { ar: 'ثقافي', en: 'Cultural', fr: 'Culturel', de: 'Kulturell', es: 'Cultural', it: 'Culturale', zh: '文化', ja: '文化的', tr: 'Kültürel' },
  other: { ar: 'أخرى', en: 'Other', fr: 'Autre', de: 'Andere', es: 'Otro', it: 'Altro', zh: '其他', ja: 'その他', tr: 'Diğer' },
  featuredPlaces: { ar: 'أماكن مميزة', en: 'Featured Places', fr: 'Lieux en vedette', de: 'Ausgewählte Orte', es: 'Lugares destacados', it: 'Luoghi in evidenza', zh: '精选地点', ja: 'おすすめの場所', tr: 'Öne Çıkan Yerler' },
  recentlyAdded: { ar: 'أضيفت مؤخراً', en: 'Recently Added', fr: 'Ajoutés récemment', de: 'Kürzlich hinzugefügt', es: 'Recientemente añadidos', it: 'Aggiunti di recente', zh: '最近添加', ja: '最近追加', tr: 'Son Eklenenler' },
  allPlaces: { ar: 'جميع الأماكن', en: 'All Places', fr: 'Tous les lieux', de: 'Alle Orte', es: 'Todos los lugares', it: 'Tutti i luoghi', zh: '所有地点', ja: 'すべての場所', tr: 'Tüm Yerler' },
  statistics: { ar: 'الإحصائيات', en: 'Statistics', fr: 'Statistiques', de: 'Statistiken', es: 'Estadísticas', it: 'Statistiche', zh: '统计', ja: '統計', tr: 'İstatistikler' },
  totalPlaces: { ar: 'إجمالي الأماكن', en: 'Total Places', fr: 'Total des lieux', de: 'Orte gesamt', es: 'Total de lugares', it: 'Luoghi totali', zh: '总地点', ja: '合計場所', tr: 'Toplam Yer' },
  totalViews: { ar: 'إجمالي المشاهدات', en: 'Total Views', fr: 'Total des vues', de: 'Aufrufe gesamt', es: 'Vistas totales', it: 'Visualizzazioni totali', zh: '总浏览量', ja: '合計ビュー', tr: 'Toplam Görüntüleme' },
  announcements: { ar: 'الإعلانات', en: 'Announcements', fr: 'Annonces', de: 'Ankündigungen', es: 'Anuncios', it: 'Annunci', zh: '公告', ja: '発表', tr: 'Duyurular' },
  addPlace: { ar: 'إضافة مكان', en: 'Add Place', fr: 'Ajouter un lieu', de: 'Ort hinzufügen', es: 'Añadir lugar', it: 'Aggiungi luogo', zh: '添加地点', ja: '場所を追加', tr: 'Yer Ekle' },
  editPlace: { ar: 'تعديل المكان', en: 'Edit Place', fr: 'Modifier le lieu', de: 'Ort bearbeiten', es: 'Editar lugar', it: 'Modifica luogo', zh: '编辑地点', ja: '場所を編集', tr: 'Yeri Düzenle' },
  deletePlace: { ar: 'حذف المكان', en: 'Delete Place', fr: 'Supprimer le lieu', de: 'Ort löschen', es: 'Eliminar lugar', it: 'Elimina luogo', zh: '删除地点', ja: '場所を削除', tr: 'Yeri Sil' },
  createAnnouncement: { ar: 'إنشاء إعلان', en: 'Create Announcement', fr: 'Créer une annonce', de: 'Ankündigung erstellen', es: 'Crear anuncio', it: 'Crea annuncio', zh: '创建公告', ja: '発表を作成', tr: 'Duyuru Oluştur' },
  save: { ar: 'حفظ', en: 'Save', fr: 'Sauvegarder', de: 'Speichern', es: 'Guardar', it: 'Salva', zh: '保存', ja: '保存', tr: 'Kaydet' },
  cancel: { ar: 'إلغاء', en: 'Cancel', fr: 'Annuler', de: 'Abbrechen', es: 'Cancelar', it: 'Annulla', zh: '取消', ja: 'キャンセル', tr: 'İptal' },
  delete: { ar: 'حذف', en: 'Delete', fr: 'Supprimer', de: 'Löschen', es: 'Eliminar', it: 'Elimina', zh: '删除', ja: '削除', tr: 'Sil' },
  name: { ar: 'الاسم', en: 'Name', fr: 'Nom', de: 'Name', es: 'Nombre', it: 'Nome', zh: '名称', ja: '名前', tr: 'İsim' },
  description: { ar: 'الوصف', en: 'Description', fr: 'Description', de: 'Beschreibung', es: 'Descripción', it: 'Descrizione', zh: '描述', ja: '説明', tr: 'Açıklama' },
  image: { ar: 'الصورة', en: 'Image', fr: 'Image', de: 'Bild', es: 'Imagen', it: 'Immagine', zh: '图片', ja: '画像', tr: 'Resim' },
  views: { ar: 'المشاهدات', en: 'Views', fr: 'Vues', de: 'Aufrufe', es: 'Vistas', it: 'Visualizzazioni', zh: '浏览量', ja: 'ビュー', tr: 'Görüntüleme' },
  source: { ar: 'المصدر', en: 'Source', fr: 'Source', de: 'Quelle', es: 'Fuente', it: 'Fonte', zh: '来源', ja: 'ソース', tr: 'Kaynak' },
  manual: { ar: 'يدوي', en: 'Manual', fr: 'Manuel', de: 'Manuell', es: 'Manual', it: 'Manuale', zh: '手动', ja: '手動', tr: 'Manuel' },
  wikipedia: { ar: 'ويكيبيديا', en: 'Wikipedia', fr: 'Wikipedia', de: 'Wikipedia', es: 'Wikipedia', it: 'Wikipedia', zh: '维基百科', ja: 'ウィキペディア', tr: 'Vikipedi' },
  users: { ar: 'المستخدمين', en: 'Users', fr: 'Utilisateurs', de: 'Benutzer', es: 'Usuarios', it: 'Utenti', zh: '用户', ja: 'ユーザー', tr: 'Kullanıcılar' },
  admins: { ar: 'المشرفين', en: 'Admins', fr: 'Admins', de: 'Admins', es: 'Admins', it: 'Admin', zh: '管理员', ja: '管理者', tr: 'Yöneticiler' },
  email: { ar: 'البريد الإلكتروني', en: 'Email', fr: 'Email', de: 'E-Mail', es: 'Correo', it: 'Email', zh: '邮箱', ja: 'メール', tr: 'E-posta' },
  role: { ar: 'الدور', en: 'Role', fr: 'Rôle', de: 'Rolle', es: 'Rol', it: 'Ruolo', zh: '角色', ja: 'ロール', tr: 'Rol' },
  actions: { ar: 'الإجراءات', en: 'Actions', fr: 'Actions', de: 'Aktionen', es: 'Acciones', it: 'Azioni', zh: '操作', ja: 'アクション', tr: 'İşlemler' },
  welcomeMessage: { ar: 'مرحباً بك في رحلة استكشاف عجائب مصر المخفية', en: "Welcome to Egypt's hidden wonders", fr: "Bienvenue aux merveilles cachées de l'Égypte", de: 'Willkommen zu den verborgenen Wundern Ägyptens', es: 'Bienvenido a las maravillas ocultas de Egipto', it: "Benvenuti alle meraviglie nascoste dell'Egitto", zh: '欢迎探索埃及的隐藏奇迹', ja: 'エジプトの隠れた奇跡へようこそ', tr: "Mısır'ın gizli harikalarına hoş geldiniz" },
  exploreNow: { ar: 'استكشف الآن', en: 'Explore Now', fr: 'Explorer maintenant', de: 'Jetzt erkunden', es: 'Explorar ahora', it: 'Esplora ora', zh: '立即探索', ja: '今すぐ探索', tr: 'Şimdi Keşfet' },
  hiddenGems: { ar: 'جواهر خفية', en: 'Hidden Gems', fr: 'Trésors cachés', de: 'Verborgene Schätze', es: 'Joyas ocultas', it: 'Gemme nascoste', zh: '隐藏宝藏', ja: '隠れた宝石', tr: 'Gizli Hazineler' },
  latitude: { ar: 'خط العرض', en: 'Latitude', fr: 'Latitude', de: 'Breitengrad', es: 'Latitud', it: 'Latitudine', zh: '纬度', ja: '緯度', tr: 'Enlem' },
  longitude: { ar: 'خط الطول', en: 'Longitude', fr: 'Longitude', de: 'Längengrad', es: 'Longitud', it: 'Longitudine', zh: '经度', ja: '経度', tr: 'Boylam' },
  featured: { ar: 'مميز', en: 'Featured', fr: 'En vedette', de: 'Empfohlen', es: 'Destacado', it: 'In evidenza', zh: '精选', ja: 'おすすめ', tr: 'Öne Çıkan' },
  active: { ar: 'نشط', en: 'Active', fr: 'Actif', de: 'Aktiv', es: 'Activo', it: 'Attivo', zh: '活跃', ja: 'アクティブ', tr: 'Aktif' },
  inactive: { ar: 'غير نشط', en: 'Inactive', fr: 'Inactif', de: 'Inaktiv', es: 'Inactivo', it: 'Inattivo', zh: '不活跃', ja: '非アクティブ', tr: 'Aktif Değil' },
  type: { ar: 'النوع', en: 'Type', fr: 'Type', de: 'Typ', es: 'Tipo', it: 'Tipo', zh: '类型', ja: 'タイプ', tr: 'Tür' },
  info: { ar: 'معلومات', en: 'Info', fr: 'Info', de: 'Info', es: 'Info', it: 'Info', zh: '信息', ja: '情報', tr: 'Bilgi' },
  warning: { ar: 'تحذير', en: 'Warning', fr: 'Avertissement', de: 'Warnung', es: 'Advertencia', it: 'Avviso', zh: '警告', ja: '警告', tr: 'Uyarı' },
  success: { ar: 'نجاح', en: 'Success', fr: 'Succès', de: 'Erfolg', es: 'Éxito', it: 'Successo', zh: '成功', ja: '成功', tr: 'Başarı' },
  error: { ar: 'خطأ', en: 'Error', fr: 'Erreur', de: 'Fehler', es: 'Error', it: 'Errore', zh: '错误', ja: 'エラー', tr: 'Hata' },
  title: { ar: 'العنوان', en: 'Title', fr: 'Titre', de: 'Titel', es: 'Título', it: 'Titolo', zh: '标题', ja: 'タイトル', tr: 'Başlık' },
  content: { ar: 'المحتوى', en: 'Content', fr: 'Contenu', de: 'Inhalt', es: 'Contenido', it: 'Contenuto', zh: '内容', ja: 'コンテンツ', tr: 'İçerik' },
  searchWikipedia: { ar: 'بحث في ويكيبيديا', en: 'Search Wikipedia', fr: 'Rechercher sur Wikipedia', de: 'Wikipedia durchsuchen', es: 'Buscar en Wikipedia', it: 'Cerca su Wikipedia', zh: '搜索维基百科', ja: 'Wikipediaを検索', tr: "Vikipedi'de Ara" },
  addFromWikipedia: { ar: 'إضافة من ويكيبيديا', en: 'Add from Wikipedia', fr: 'Ajouter depuis Wikipedia', de: 'Von Wikipedia hinzufügen', es: 'Añadir desde Wikipedia', it: 'Aggiungi da Wikipedia', zh: '从维基百科添加', ja: 'Wikipediaから追加', tr: "Vikipedi'den Ekle" },
  fetchingFromWikipedia: { ar: 'جاري الجلب من ويكيبيديا...', en: 'Fetching from Wikipedia...', fr: 'Récupération depuis Wikipedia...', de: 'Wird von Wikipedia abgerufen...', es: 'Obteniendo de Wikipedia...', it: 'Recupero da Wikipedia...', zh: '正在从维基百科获取...', ja: 'Wikipediaから取得中...', tr: "Vikipedi'den alınıyor..." },
  placeAdded: { ar: 'تم إضافة المكان بنجاح', en: 'Place added successfully', fr: 'Lieu ajouté avec succès', de: 'Ort erfolgreich hinzugefügt', es: 'Lugar añadido correctamente', it: 'Luogo aggiunto con successo', zh: '地点添加成功', ja: '場所が正常に追加されました', tr: 'Yer başarıyla eklendi' },
  errorFetching: { ar: 'حدث خطأ', en: 'Error occurred', fr: 'Erreur survenue', de: 'Fehler aufgetreten', es: 'Error ocurrido', it: 'Errore', zh: '发生错误', ja: 'エラーが発生しました', tr: 'Hata oluştu' },
  aiAssistant: { ar: 'المساعد الذكي', en: 'AI Assistant', fr: 'Assistant IA', de: 'KI-Assistent', es: 'Asistente IA', it: 'Assistente IA', zh: 'AI助手', ja: 'AIアシスタント', tr: 'AI Asistanı' },
  typeYourQuestion: { ar: 'اكتب سؤالك...', en: 'Type your question...', fr: 'Tapez votre question...', de: 'Ihre Frage eingeben...', es: 'Escribe tu pregunta...', it: 'Scrivi la tua domanda...', zh: '输入您的问题...', ja: '質問を入力...', tr: 'Sorunuzu yazın...' },
  logout: { ar: 'تسجيل الخروج', en: 'Logout', fr: 'Déconnexion', de: 'Abmelden', es: 'Cerrar sesión', it: 'Disconnetti', zh: '退出', ja: 'ログアウト', tr: 'Çıkış' },
  login: { ar: 'تسجيل الدخول', en: 'Login', fr: 'Connexion', de: 'Anmelden', es: 'Iniciar sesión', it: 'Accedi', zh: '登录', ja: 'ログイン', tr: 'Giriş' },
  backToHome: { ar: 'العودة للرئيسية', en: 'Back to Home', fr: "Retour à l'accueil", de: 'Zurück zur Startseite', es: 'Volver al inicio', it: 'Torna alla home', zh: '返回主页', ja: 'ホームに戻る', tr: 'Ana Sayfaya Dön' },
  sharePlace: { ar: 'مشاركة المكان', en: 'Share Place', fr: 'Partager le lieu', de: 'Ort teilen', es: 'Compartir lugar', it: 'Condividi luogo', zh: '分享地点', ja: '場所を共有', tr: 'Yeri Paylaş' },
  relatedPlaces: { ar: 'أماكن ذات صلة', en: 'Related Places', fr: 'Lieux connexes', de: 'Verwandte Orte', es: 'Lugares relacionados', it: 'Luoghi correlati', zh: '相关地点', ja: '関連する場所', tr: 'İlgili Yerler' },
  openInMaps: { ar: 'فتح في الخرائط', en: 'Open in Maps', fr: 'Ouvrir dans Maps', de: 'In Karten öffnen', es: 'Abrir en Maps', it: 'Apri in Maps', zh: '在地图中打开', ja: 'マップで開く', tr: "Haritalarda Aç" },
  createdAt: { ar: 'تاريخ الإنشاء', en: 'Created At', fr: 'Créé le', de: 'Erstellt am', es: 'Creado el', it: 'Creato il', zh: '创建时间', ja: '作成日', tr: 'Oluşturulma Tarihi' },
  askAboutPlace: { ar: 'اسأل عن أي مكان', en: 'Ask about any place', fr: 'Posez une question', de: 'Fragen Sie nach einem Ort', es: 'Pregunta sobre un lugar', it: 'Chiedi di un luogo', zh: '询问任何地方', ja: '場所について質問', tr: 'Herhangi bir yer hakkında sorun' },
  autoFetch: { ar: 'جلب تلقائي', en: 'Auto Fetch', fr: 'Récupération auto', de: 'Automatisch abrufen', es: 'Obtención automática', it: 'Recupero automatico', zh: '自动获取', ja: '自動取得', tr: 'Otomatik Al' },
  fetchInterval: { ar: 'فترة الجلب (دقائق)', en: 'Fetch Interval (minutes)', fr: 'Intervalle (minutes)', de: 'Abrufintervall (Minuten)', es: 'Intervalo (minutos)', it: 'Intervallo (minuti)', zh: '获取间隔（分钟）', ja: '取得間隔（分）', tr: 'Getirme Aralığı (dakika)' },
  manageAdmins: { ar: 'إدارة المشرفين', en: 'Manage Admins', fr: 'Gérer les admins', de: 'Admins verwalten', es: 'Gestionar admins', it: 'Gestisci admin', zh: '管理管理员', ja: '管理者を管理', tr: 'Yöneticileri Yönet' },
  siteSettings: { ar: 'إعدادات الموقع', en: 'Site Settings', fr: 'Paramètres du site', de: 'Website-Einstellungen', es: 'Configuración del sitio', it: 'Impostazioni del sito', zh: '网站设置', ja: 'サイト設定', tr: 'Site Ayarları' },
};

const LanguageContext = createContext();

export const LANGUAGES = [
  { code: 'ar', name: 'العربية', flag: '🇪🇬', rtl: true },
  { code: 'en', name: 'English', flag: '🇬🇧', rtl: false },
  { code: 'fr', name: 'Français', flag: '🇫🇷', rtl: false },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', rtl: false },
  { code: 'es', name: 'Español', flag: '🇪🇸', rtl: false },
  { code: 'it', name: 'Italiano', flag: '🇮🇹', rtl: false },
  { code: 'zh', name: '中文', flag: '🇨🇳', rtl: false },
  { code: 'ja', name: '日本語', flag: '🇯🇵', rtl: false },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷', rtl: false },
];

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('ar');
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const savedLang = localStorage.getItem('egypt_lang') || 'ar';
    const savedTheme = localStorage.getItem('egypt_theme') || 'light';
    setLanguage(savedLang);
    setTheme(savedTheme);
  }, []);

  useEffect(() => {
    localStorage.setItem('egypt_lang', language);
    const langInfo = LANGUAGES.find(l => l.code === language);
    document.documentElement.dir = langInfo?.rtl ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    localStorage.setItem('egypt_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const t = (key) => {
    return baseKeys[key]?.[language] || baseKeys[key]?.['en'] || key;
  };

  const getLocalizedField = (item, field) => {
    if (!item) return '';
    return item[`${field}_${language}`] || item[`${field}_en`] || item[`${field}_ar`] || '';
  };

  const isRTL = LANGUAGES.find(l => l.code === language)?.rtl || false;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, theme, setTheme, t, getLocalizedField, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};

export default LanguageContext;