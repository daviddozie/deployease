#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const readline = require("readline-sync");

// Function to detect available platforms
function detectPlatform() {
    if (fs.existsSync("netlify.toml")) return "netlify";
    if (fs.existsSync("vercel.json")) return "vercel";
    if (fs.existsSync("firebase.json")) return "firebase";
    if (fs.existsSync(".github/workflows")) return "github";
    if (fs.existsSync("cloudflare-pages.toml")) return "cloudflare";
    if (fs.existsSync("render.yaml")) return "render";
    if (fs.existsSync("railway.json")) return "railway";
    if (fs.existsSync("koyeb.yaml")) return "koyeb";
    return null;
}

// Function to prompt user for platform selection
function selectPlatform() {
    console.log("\n📢 Select a deployment platform:");
    console.log("1. Netlify");
    console.log("2. Vercel");
    console.log("3. Firebase");
    console.log("4. GitHub Pages");
    console.log("5. Cloudflare Pages");
    console.log("6. Render");
    console.log("7. Surge.sh");
    console.log("8. Railway");
    console.log("9. Koyeb");
    
    const choice = readline.question("\nEnter the number of your choice: ").trim();

    switch (choice) {
        case "1": return "netlify";
        case "2": return "vercel";
        case "3": return "firebase";
        case "4": return "github";
        case "5": return "cloudflare";
        case "6": return "render";
        case "7": return "surge";
        case "8": return "railway";
        case "9": return "koyeb";
        default:
            console.log("❌ Invalid choice. Defaulting to Vercel.");
            return "vercel";
    }
}

// Function to deploy based on selected platform
function deploy() {
    let platform = detectPlatform();
    if (!platform) {
        platform = selectPlatform(); // Prompt user if no config is detected
    }

    console.log(`\n🚀 Deploying to ${platform}...\n`);

    try {
        switch (platform) {
            case "netlify":
                execSync("netlify deploy --prod", { stdio: "inherit" });
                break;
            case "vercel":
                execSync("vercel deploy --prod --yes", { stdio: "inherit" });
                break;
            case "firebase":
                execSync("firebase deploy", { stdio: "inherit" });
                break;
            case "github":
                execSync("git push origin main", { stdio: "inherit" });
                console.log("🎉 GitHub Pages will auto-deploy your project.");
                break;
            case "cloudflare":
                execSync("wrangler pages publish ./ --project-name=my-project", { stdio: "inherit" });
                break;
            case "render":
                console.log("⚠️ Render deploys automatically on Git push.");
                break;
            case "surge":
                execSync("surge ./", { stdio: "inherit" });
                break;
            case "railway":
                execSync("railway up", { stdio: "inherit" });
                break;
            case "koyeb":
                execSync("koyeb deploy", { stdio: "inherit" });
                break;
            default:
                console.log("❌ Unsupported platform.");
        }
    } catch (error) {
        console.error(`❌ Deployment failed: ${error.message}`);
    }
}

// Run deployment when "deployease deploy" is executed
if (process.argv[2] === "deploy") {
    deploy();
} else {
    console.log("Usage: deployease deploy");
}
