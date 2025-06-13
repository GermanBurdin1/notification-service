#!/bin/sh
set -e

echo "🔄 Starting backup..."

mkdir -p "$BACKUP_DIR"

backup_db() {
  HOST=$1
  PORT=$2
  USER=$3
  PASSWORD=$4
  DB_NAME=$5
  OUT_FILE=$6

  echo "📦 Backing up $DB_NAME..."
  PGPASSWORD=$PASSWORD pg_dump -h $HOST -p $PORT -U $USER -F c $DB_NAME > "$BACKUP_DIR/$OUT_FILE"
}

backup_db $AUTH_DB_HOST $AUTH_DB_PORT $AUTH_DB_USER $AUTH_DB_PASSWORD $AUTH_DB_NAME auth.backup
backup_db $LESSON_DB_HOST $LESSON_DB_PORT $LESSON_DB_USER $LESSON_DB_PASSWORD $LESSON_DB_NAME lesson.backup
backup_db $NOTIF_DB_HOST $NOTIF_DB_PORT $NOTIF_DB_USER $NOTIF_DB_PASSWORD $NOTIF_DB_NAME notifications.backup
backup_db $VOCAB_DB_HOST $VOCAB_DB_PORT $VOCAB_DB_USER $VOCAB_DB_PASSWORD $VOCAB_DB_NAME vocab.backup
backup_db $MINDMAP_DB_HOST $MINDMAP_DB_PORT $MINDMAP_DB_USER $MINDMAP_DB_PASSWORD $MINDMAP_DB_NAME mindmap.backup

echo "✅ All databases backed up!"
