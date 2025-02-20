# DeployEase - Deploy Frontend Apps Easily 🚀
DeployEase is a CLI tool that simplifies the deployment of frontend applications to multiple free hosting platforms.

---

## **Installation**  

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

### **Current Deployment Support**  
⚠️ **For now, DeployEase can only deploy to Vercel.** We are actively working to support all other platforms soon! Stay tuned for updates.  

---

## **Deployment Guide**  

### **🔹 Deploying Your Project**  
If a configuration file (`vercel.json`) is found, DeployEase will automatically detect and deploy to Vercel.  

If no configuration is found, you'll be prompted to confirm deployment to Vercel.  
```sh
Deploying to Vercel...
```
Deployment starts immediately.

---

### **🔹 Manual Deployment**  
To manually specify a platform (once supported), use:  
```sh
deployease deploy --platform <platform-name>
```  
For example:  
```sh
deployease deploy --platform vercel
```  

---

### **🔹 Listing Deployed Projects**  
To view all deployed projects across platforms (once available), run:  
```sh
deployease list-projects
```  

---

## **Contributing**  
Contributions are welcome! Feel free to open issues or submit pull requests.  

---

## **License**  
This project is licensed under the **ISC License**.  

---

🚀 **Happy Deploying with DeployEase!** 🚀
