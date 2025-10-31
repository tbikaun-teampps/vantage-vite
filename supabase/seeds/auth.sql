-- Create test users
-- Password Team2025!
INSERT INTO auth.users
("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous")
VALUES
('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'tbikaun+vantage_local@teampps.com.au', '$2a$10$UkCKciSi7RIOxC2fjk3psOMp0wgMGWsJHJOgZGZBGlWNe69rDSQui', '2025-10-31 02:21:44.433362+00', null, '', null, '', null, '', '', null, null, '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', null, '2025-10-31 02:21:44.423295+00', '2025-10-31 02:21:44.435131+00', null, null, '', '', null, '', '0', null, '', null, 'false', null, 'false');

-- Update users profile
UPDATE public.profiles
SET subscription_tier = 'consultant', subscription_features = '{"maxCompanies": 999}', onboarded = true, onboarded_at = now(), full_name = 'Tyler Bikaun (Test User)', is_admin = true
WHERE id = '00000000-0000-0000-0000-000000000001';