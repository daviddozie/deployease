# DeployEase - Deploy Frontend Apps Easily 🚀

DeployEase is a CLI tool that simplifies the deployment of frontend applications to platforms like **Netlify, Vercel, and Firebase**.

## Installation

To install DeployEase globally, run:

### **Using npm**
```sh
npm install -g deployease
```
### **Using yarn**
```sh
yarn global add deployease
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

DeployEase supports **Netlify**, **Vercel**, and **Firebase**. You can specify the platform as an option or select it interactively.

#### Deploy to Netlify

1. **Ensure you have the Netlify CLI installed**:
   ```sh
   npm install -g netlify-cli
   ```
2. **Login to Netlify**:
   ```sh
   netlify login
   ```
3. **Run the deploy command**:
   ```sh
   deployease deploy --platform netlify
   ```
   Or interactively:
   ```sh
   deployease deploy
   ```
   Then select **Netlify** from the prompt.

#### Deploy to Vercel

1. **Ensure you have the Vercel CLI installed**:
   ```sh
   npm install -g vercel
   ```
2. **Login to Vercel**:
   ```sh
   vercel login
   ```
3. **Run the deploy command**:
   ```sh
   vercel --project name
   ```
   Or interactively:
   ```sh
   deployease deploy
   ```
   Then select **Vercel** from the prompt.

#### Deploy to Firebase

1. **Ensure you have Firebase CLI installed**:
   ```sh
   npm install -g firebase-tools
   ```
2. **Login to Firebase**:
   ```sh
   firebase login
   ```
3. **Initialize Firebase in your project (if not already done)**:
   ```sh
   firebase init
   ```
4. **Run the deploy command**:
   ```sh
   deployease deploy --platform firebase
   ```
   Or interactively:
   ```sh
   deployease deploy
   ```
   Then select **Firebase** from the prompt.

## Listing Deployed Projects

To view deployed projects across all platforms, run:

```sh
deployease list-projects
```

This will fetch a list of deployed projects from **Netlify, Vercel, and Firebase**.

## Contributing

Feel free to contribute by opening issues or submitting pull requests.

## License

This project is licensed under the **ISC License**.

---
Happy Deploying! 🚀
