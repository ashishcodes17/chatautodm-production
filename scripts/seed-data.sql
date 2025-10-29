-- Insert sample users
INSERT INTO users (id, email, name, auth_provider) VALUES
('u_demo_1', 'demo@example.com', 'Demo User', 'google'),
('u_demo_2', 'test@example.com', 'Test User', 'google');

-- Insert sample workspaces
INSERT INTO workspaces (id, user_id, name, description) VALUES
('ws_demo_1', 'u_demo_1', 'My Brand', 'Main business workspace'),
('ws_demo_2', 'u_demo_1', 'Client Project', 'Client social media management'),
('ws_demo_3', 'u_demo_2', 'Personal Brand', 'Personal Instagram automation');

-- Insert sample Instagram accounts
INSERT INTO instagram_accounts (
    id, workspace_id, user_id, username, instagram_user_id, 
    access_token, followers_count, following_count, media_count
) VALUES
('ig_demo_1', 'ws_demo_1', 'u_demo_1', 'mybrand_official', '17841400000001', 'token_1', 5420, 234, 156),
('ig_demo_2', 'ws_demo_2', 'u_demo_1', 'client_account', '17841400000002', 'token_2', 12300, 567, 89),
('ig_demo_3', 'ws_demo_3', 'u_demo_2', 'personal_creator', '17841400000003', 'token_3', 8900, 445, 234);

-- Insert sample webhook events
INSERT INTO webhook_events (id, instagram_account_id, event_type, event_data) VALUES
('evt_1', 'ig_demo_1', 'comments', '{"comment_id": "123", "text": "Great post!", "user": "follower1"}'),
('evt_2', 'ig_demo_1', 'messages', '{"message_id": "456", "text": "Hello!", "sender": "customer1"}'),
('evt_3', 'ig_demo_2', 'mentions', '{"mention_id": "789", "text": "@client_account love this!", "user": "fan1"}');
