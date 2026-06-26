-- Site settings (key-value store managed by super admin)
CREATE TABLE IF NOT EXISTS site_settings (
  key        text PRIMARY KEY,
  value      text NOT NULL DEFAULT '',
  updated_at timestamptz DEFAULT now()
);

INSERT INTO site_settings (key, value) VALUES
  ('contact_email',                  'info@myreviewgate.com'),
  ('contact_phone',                  '+972-50-000-0000'),
  ('accessibility_coordinator_name', 'מנהל נגישות'),
  ('accessibility_coordinator_email','accessibility@myreviewgate.com'),
  ('accessibility_coordinator_phone','+972-50-000-0000'),
  ('privacy_policy_he', E'מדיניות פרטיות – myReviewGate\n\n1. איסוף מידע\nאנו אוספים מידע שנמסר מרצון על ידי המשתמשים בעת ההרשמה או יצירת קשר.\n\n2. שימוש במידע\nהמידע משמש לצורך מתן השירות, יצירת קשר עם המשתמש ושיפור חוויית השימוש.\n\n3. שמירת מידע\nהמידע נשמר בשרתים מאובטחים ואינו מועבר לצדדים שלישיים ללא הסכמת המשתמש.\n\n4. אבטחת מידע\nאנו נוקטים אמצעי אבטחה מתאימים להגנה על המידע האישי.\n\n5. יצירת קשר\nלשאלות בנושא פרטיות, פנה אלינו דרך עמוד יצירת הקשר.'),
  ('terms_he', E'תקנון שימוש – myReviewGate\n\n1. קבלת התנאים\nהשימוש בשירות מהווה הסכמה מלאה לתנאים אלו.\n\n2. השירות\nmyReviewGate מספקת כלי לניהול חוות דעת לעסקים, המאפשר ניתוב לקוחות לביקורות גוגל או משוב פרטי.\n\n3. חשבון המשתמש\nכל משתמש אחראי על שמירת פרטי הכניסה שלו ועל כל פעילות שתתבצע דרך חשבונו.\n\n4. הגבלת אחריות\nהשירות ניתן כמות שהוא. myReviewGate אינה אחראית לנזקים עקיפים הנובעים מהשימוש בשירות.\n\n5. שינויים בתנאים\nאנו שומרים לעצמנו הזכות לעדכן תנאים אלו. המשך השימוש מהווה הסכמה לתנאים המעודכנים.\n\n6. יצירת קשר\nלשאלות, פנה אלינו דרך עמוד יצירת הקשר.')
ON CONFLICT (key) DO NOTHING;

-- Contact messages from the contact page
CREATE TABLE IF NOT EXISTS contact_messages (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name       text NOT NULL,
  email      text NOT NULL,
  subject    text,
  message    text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE site_settings   ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read site_settings" ON site_settings;
CREATE POLICY "Public read site_settings"
  ON site_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Super admin manage site_settings" ON site_settings;
CREATE POLICY "Super admin manage site_settings"
  ON site_settings FOR ALL USING (get_my_role() = 'super_admin');

DROP POLICY IF EXISTS "Anyone can submit contact" ON contact_messages;
CREATE POLICY "Anyone can submit contact"
  ON contact_messages FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Super admin reads contact messages" ON contact_messages;
CREATE POLICY "Super admin reads contact messages"
  ON contact_messages FOR SELECT USING (get_my_role() = 'super_admin');
