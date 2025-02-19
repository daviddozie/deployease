# DeployEase - Deploy Frontend Apps Easily 🚀

DeployEase is a CLI tool that simplifies the deployment of frontend applications to multiple free hosting platforms.

## Installation

To install DeployEase globally, run:

### **Using npm**
```sh
npm install -D deployease
```

### **Using yarn**
```sh
yarn global add deployease
```

### **Using pnpm**
```sh
pnpm add -D deployease
```

### **Using bun**
```sh
bun add -D deployease
```

## Usage

DeployEase provides a simple command to deploy your frontend projects.

```sh
deployease deploy
```

### Deployment Platforms

DeployEase supports the following free hosting platforms:

- **Netlify**
- **Vercel**
- **Firebase**
- **GitHub Pages**
- **Cloudflare Pages**
- **Render**
- **Surge.sh**

#### **Important: Project Name Format**
- Project names must be **lowercase**.
- Avoid special characters except `.`, `_`, and `-`.
- Names **cannot** contain `---` (triple hyphens).
- If your project folder is **uppercase**, rename it before deploying.

### **Deploying Your Project**

When you run:

```sh
deployease deploy
```

If a configuration file is detected (`netlify.toml`, `vercel.json`, `firebase.json`, etc.), DeployEase will automatically deploy to the corresponding platform.

If no configuration file is found, you will be prompted to choose a platform:

```sh
Select a deployment platform:
1. Netlify
2. Vercel
3. Firebase
4. GitHub Pages
5. Cloudflare Pages
6. Render
7. Surge.sh
```

After selection, deployment will start immediately.

### **Manual Deployment**

To specify a platform manually, use:

```sh
deployease deploy --platform <platform-name>
```

For example:
```sh
deployease deploy --platform vercel
```

### **Listing Deployed Projects**

To view deployed projects across all platforms, run:
```sh
deployease list-projects
```

## Contributing

Feel free to contribute by opening issues or submitting pull requests.

## License

This project is licensed under the **ISC License**.

---
Happy Deploying! 🚀