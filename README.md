# EASEN 売上管理

店舗の売上記録・歩合給／指名料の計算を行うWebアプリ（PWA対応・iPhone/iPad/パソコン対応）。

## 全体の流れ（初回のみ）

1. Firebase Consoleで、このリポジトリの `firestore.rules` の中身を「ルール」タブに貼り付けて公開する
2. GitHubの「Settings → Pages → Source」を「GitHub Actions」に設定する
3. `main` ブランチにpushすると、GitHub Actionsが自動でビルド・公開する
4. 公開URL: `https://yyy924yyy-cell.github.io/easen-uriagekanri/`

## ログイン

| 画面上のID | メールアドレス（内部的に使用） | 権限 |
| --- | --- | --- |
| `owner` | `owner@easen.local` | オーナー |
| `staff` | `staff@easen-uriagekanri.local` | スタッフ（共有） |

## 権限まとめ

| 操作 | オーナー | スタッフ |
| --- | --- | --- |
| キャスト・店舗の閲覧 | ○ | ○ |
| キャスト・店舗の追加編集削除 | ○ | ✕ |
| 売上記録の閲覧 | 全件 | 自分（選択中のキャスト）の分のみアプリ画面上で絞り込み表示 |
| 売上記録の追加・編集・削除 | いつでも可能 | 当日入力分のみ可能（日本時間） |
| 歩合給・指名料レポート閲覧 | ○ | ✕ |
| 指名料単価などの設定変更 | ○ | ✕ |
| エクセル出力 | ○ | ✕ |

※スタッフは全員で1つのログインアカウントを共有しています。「自分のキャスト分だけ閲覧できる」制限は、アプリの画面側（選択中のキャストで絞り込み）で行っています。データベースの権限レベルでキャストごとに完全に分離したい場合は、スタッフ一人ひとりに個別のログインアカウントを発行する設計に変更する必要があります。

## フォルダ構成

```
src/
  lib/          Firebase接続・Firestore操作・エクセル出力
  contexts/     ログイン状態の管理
  pages/        画面ごとのコンポーネント（ログイン・スタッフ・オーナー）
  components/   共通UI部品
  types/        型定義
firestore.rules Firestoreセキュリティルール（Firebase Consoleに貼り付けて使用）
.github/workflows/deploy.yml  GitHub Pagesへの自動デプロイ設定
```

## 今後、内容を変更したいとき

`src/` フォルダ内のファイルを編集して `main` ブランチにpushするだけで、自動的に再ビルド・再公開されます。

## パソコンで動作確認したい場合（任意）

```
npm install
npm run dev
```
