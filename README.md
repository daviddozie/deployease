# DeployEase - Deploy Frontend Apps Easily 🚀

DeployEase is a CLI tool that simplifies the deployment of frontend applications to platforms like **Netlify, Vercel, and Firebase**.

## Installation

To install DeployEase globally, run:

### **Using npm**
```sh
npm install -g deployease --prefer-offline --no-audit --no-fund
```
### **Using yarn**
```sh
yarn global add deployease --prefer-offline
```
### **Using pnpm**
```sh
pnpm add -g deployease
```
### **Using bun**
```sh
bun add -g deployease
```

## Usage

DeployEase provides a simple command to deploy your frontend projects.

```sh
deployease deploy
```

### Deployment Platforms

DeployEase supports **Netlify**, **Vercel**, and **Firebase**. It automatically detects the correct platform if a configuration file exists (e.g., `netlify.toml`, `vercel.json`, or `firebase.json`). If no platform is detected, it defaults to **Vercel**.

#### **Important: Project Name Format**
- Project names must be **lowercase**.
- Avoid special characters except `.` `_` `-`.
- Names **cannot** contain `---` (triple hyphens).
- If your project folder is **uppercase**, rename it before deploying.

#### Deploy to Netlify

Simply run:
```sh
deployease deploy
```
If Netlify is detected, it will automatically deploy. Otherwise, specify it manually:
```sh
deployease deploy --platform netlify
```
If the Netlify CLI is not installed, DeployEase will install it automatically.

#### Deploy to Vercel

Run:
```sh
deployease deploy
```
DeployEase will detect and deploy to Vercel if a `vercel.json` file exists. Otherwise, specify it manually:
```sh
deployease deploy --platform vercel
```
If the Vercel CLI is missing, DeployEase will install it automatically.

#### Deploy to Firebase

Run:
```sh
deployease deploy
```
If Firebase is detected, it will deploy automatically. Otherwise, specify it manually:
```sh
deployease deploy --platform firebase
```
If the Firebase CLI is missing, DeployEase will install it automatically.

## Listing Deployed Projects

To view deployed projects across all platforms, run:
```sh
deployease list-projects
```
This will fetch a list of deployed projects from **Netlify, Vercel, and Firebase**.

## How to Speed Up Deployment
- Use `--prefer-offline` when installing to reduce network delays.
- Ensure your project name is lowercase to prevent deployment errors.
- Use `deployease deploy --yes` to skip confirmation prompts.
- Install the respective CLI tools (`netlify-cli`, `vercel`, `firebase-tools`) globally for even faster deployments.

## Contributing

Feel free to contribute by opening issues or submitting pull requests.

## License

This project is licensed under the **ISC License**.

---
Happy Deploying! 🚀
