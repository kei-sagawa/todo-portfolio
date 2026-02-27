# Todo App

認証付きの個人用タスク管理アプリケーションです。  
Supabaseを利用し、ユーザーごとのデータ分離をRLS（Row Level Security）で実装しています。

🔗 Live Demo: <https://todo-portfolio-seven.vercel.app/>

🔗 GitHub: <https://github.com/kei-sagawa/todo-portfolio>

---

## Overview

本アプリは「安全にユーザー単位でデータを管理できるシンプルなTodoアプリ」を目的として開発しました。

単なるCRUD実装にとどまらず、

- 認証
- データベース設計
- セキュリティ（RLS）
- 本番デプロイ

まで一通りの構成を経験することを重視しています。

---

## Features

- ユーザー登録 / ログイン（Supabase Auth）
- タスクの作成 / 取得 / 更新 / 削除
- ユーザーごとのデータ完全分離
- 本番環境へのデプロイ済み

---

## Tech Stack

### Frontend

- Vite
- React
- TypeScript

### Backend

- Supabase
  - PostgreSQL
  - Authentication
  - Row Level Security (RLS)

### Hosting

- Vercel

---

## Database Design

### todos テーブル

| Column     | Type      | Description    |
| ---------- | --------- | -------------- |
| id         | uuid      | Primary Key    |
| user_id    | uuid      | 認証ユーザーID |
| title      | text      | タスク内容     |
| status     | text      | 完了状態       |
| created_at | timestamp | 作成日時       |

---

## Security

デモ用ログイン情報

email: demo@example.com

pass: demo1234

RLSを有効化し、以下のポリシーを設定しています。

```sql
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id)

これにより、各ユーザーは自分のデータのみ操作可能です。

フロントエンド側ではなく、DBレベルでアクセス制御を行っています。

Key Implementation Points
1. 認証とデータ分離の徹底

ユーザーIDをフロント側で信用せず、RLSによって強制的に制御しています。

2. シンプルな構成

過度な抽象化を避け、個人開発として適切な構成にしています。

3. 実運用を意識したデプロイ

VercelとGitHubを連携し、pushごとの自動デプロイを構築しています。

Future Improvements

タスクの並び替え

タグ機能

期限設定

UI/UX改善

テストコードの追加

Local Setup
git clone <repository-url>
cd <project-name>
npm install

.env を作成：

VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

起動：

npm run dev
Purpose

個人開発において、

認証付きアプリの構築

DB設計

セキュリティ制御

デプロイ運用

までを一通り実装することを目的としています。
```
