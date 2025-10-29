-- Users table
CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    picture TEXT,
    auth_provider VARCHAR(50) NOT NULL DEFAULT 'google',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Workspaces table
CREATE TABLE workspaces (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
);

-- Instagram accounts table
CREATE TABLE instagram_accounts (
    id VARCHAR(255) PRIMARY KEY,
    workspace_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL,
    instagram_user_id VARCHAR(255) NOT NULL,
    access_token TEXT NOT NULL,
    token_expires_at TIMESTAMP,
    followers_count INT DEFAULT 0,
    following_count INT DEFAULT 0,
    media_count INT DEFAULT 0,
    is_connected BOOLEAN DEFAULT TRUE,
    connected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_sync_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_workspace_id (workspace_id),
    INDEX idx_user_id (user_id),
    INDEX idx_instagram_user_id (instagram_user_id)
);

-- Webhook events table (for tracking Instagram events)
CREATE TABLE webhook_events (
    id VARCHAR(255) PRIMARY KEY,
    instagram_account_id VARCHAR(255),
    event_type VARCHAR(100) NOT NULL,
    event_data JSON NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL,
    FOREIGN KEY (instagram_account_id) REFERENCES instagram_accounts(id) ON DELETE CASCADE,
    INDEX idx_instagram_account_id (instagram_account_id),
    INDEX idx_event_type (event_type),
    INDEX idx_processed (processed),
    INDEX idx_created_at (created_at)
);

-- Messages table (for storing Instagram messages)
CREATE TABLE messages (
    id VARCHAR(255) PRIMARY KEY,
    instagram_account_id VARCHAR(255) NOT NULL,
    conversation_id VARCHAR(255) NOT NULL,
    sender_id VARCHAR(255) NOT NULL,
    message_text TEXT,
    message_type VARCHAR(50) DEFAULT 'text',
    is_echo BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (instagram_account_id) REFERENCES instagram_accounts(id) ON DELETE CASCADE,
    INDEX idx_instagram_account_id (instagram_account_id),
    INDEX idx_conversation_id (conversation_id),
    INDEX idx_timestamp (timestamp)
);

-- Comments table (for storing Instagram comments)
CREATE TABLE comments (
    id VARCHAR(255) PRIMARY KEY,
    instagram_account_id VARCHAR(255) NOT NULL,
    media_id VARCHAR(255) NOT NULL,
    commenter_id VARCHAR(255) NOT NULL,
    comment_text TEXT NOT NULL,
    parent_comment_id VARCHAR(255) NULL,
    timestamp TIMESTAMP NOT NULL,
    is_hidden BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (instagram_account_id) REFERENCES instagram_accounts(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_comment_id) REFERENCES comments(id) ON DELETE CASCADE,
    INDEX idx_instagram_account_id (instagram_account_id),
    INDEX idx_media_id (media_id),
    INDEX idx_timestamp (timestamp)
);
