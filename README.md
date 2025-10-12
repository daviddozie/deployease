# DeployEase - Deploy Frontend Apps Easily 🚀

DeployEase is a powerful CLI tool that simplifies the deployment of frontend applications to multiple hosting platforms with just one command.

## Features ✨

- 🎯 One-command deployment to multiple platforms
- 🔍 Automatic platform detection
- 🛠️ Automatic CLI tool installation
- 🔐 Seamless authentication handling
- ⚙️ Configuration file generation
- 💻 Interactive platform selection

## Supported Platforms 🌐

- Netlify
- Vercel
- Firebase
- GitHub Pages
- Cloudflare Pages
- Render
- Railway
- Koyeb

## Installation 📦

You can install DeployEase **globally** for system-wide use or as a **dev dependency** within a project.  

### **🌍 Global Installation (Recommended)**  
To use DeployEase from anywhere in your terminal, install it globally:  

#### **Using npm**  
```sh
npm install -g deployease
```  
#### **Using yarn**  
```sh
yarn global add deployease
```  
#### **Using pnpm**  
```sh
pnpm add -g deployease
```  
#### **Using bun**  
```sh
bun add -g deployease
```  

### **📦 Install as a Dev Dependency (Per Project)**  
If you prefer to use DeployEase within a project (e.g., in `package.json` scripts), install it as a **dev dependency**:  

#### **Using npm**  
```sh
npm install --save-dev deployease
```  
#### **Using yarn**  
```sh
yarn add -D deployease
```  
#### **Using pnpm**  
```sh
pnpm add -D deployease
```  
#### **Using bun**  
```sh
bun add -D deployease
```  

Then, you can add a script in `package.json` for deployment:  
```json
{
  "scripts": {
    "deploy": "deployease deploy"
  }
}
```
Run it with:  
```sh
npm run deploy
```

---

## **Usage**  

DeployEase provides a simple command to deploy your frontend projects:  
```sh
deployease deploy
```  

## Usage 🛠️

### Quick Start
1. Navigate to your project directory:
```sh
cd your-project-directory
```

2. Deploy your project:
```sh
deployease deploy
```

### What Happens During Deployment

1. **Platform Detection**: DeployEase automatically detects your deployment platform based on configuration files:
   - `netlify.toml` → Netlify
   - `vercel.json` → Vercel
   - `firebase.json` → Firebase
   - `.github/workflows` → GitHub Pages
   - `cloudflare-pages.toml` → Cloudflare Pages
   - `render.yaml` → Render
   - `railway.json` → Railway
   - `koyeb.yaml` → Koyeb

2. **Interactive Selection**: If no platform is detected, you'll be prompted to choose one.

3. **Automatic Setup**: DeployEase will:
   - Install required CLI tools if missing
   - Handle authentication if needed
   - Create necessary configuration files
   - Deploy your application

## Platform-Specific Guide 📚

### Netlify
- Automatic CLI setup and authentication
- Supports custom build commands and environment variables
- Handles redirects and headers configuration

### Vercel
- Zero-config deployments for Next.js, React, Vue, and more
- Team deployment support
- Environment variable management

### Firebase
- Interactive Firebase project setup
- Hosting configuration management
- Supports multiple site deployments

### GitHub Pages
- Automatic gh-pages setup
- Handles build process
- Custom domain support

### Cloudflare Pages
- Supports both Pages and Workers
- Automatic Wrangler CLI configuration
- Custom build settings

### Render
- Git-based deployments
- Environment variable configuration
- Build and start command setup

### Railway
- Automatic project linking
- Environment setup
- Service deployment management

### Koyeb
- Container-based deployments
- Environment configuration
- Service scaling support

---

## Requirements 📋

- Node.js 14 or higher
- npm (or yarn/pnpm/bun)
- Git (for certain platforms)

## Troubleshooting 🔍

If you encounter issues:

1. **Authentication Issues**
   - Run `deployease deploy` again
   - The tool will guide you through the login process

2. **Missing Dependencies**
   - DeployEase will automatically install required CLIs
   - If manual installation is needed, follow the prompts

3. **Build Errors**
   - Check if your build command is correct
   - Verify your project structure
   - Ensure all dependencies are installed

4. **Deployment Failures**
   - Check your internet connection
   - Verify platform-specific requirements
   - Follow the error messages guidance

## Contributing 🤝

Contributions are welcome! Feel free to:
- Open issues
- Submit pull requests
- Suggest new features
- Improve documentation

## License 📄

ISC License

## Author ✍️

David Mgbede

---
Made with ❤️ by DeployEase Team
