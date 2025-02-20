#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");

//This line ensure readline-sync is installed before requiring it
function ensureReadlineSync() {
    try {
        require.resolve("readline-sync");
    } catch (e) {
        console.log("\n⚙️ Installing readline-sync...");
        execSync("npm install readline-sync", { stdio: "inherit" });
        console.log("✅ readline-sync installed successfully!\n");
    }
    global.readline = require("readline-sync");
}

ensureReadlineSync();

//this function to checks if a CLI tool is installed
function isCLIInstalled(command) {
    try {
        execSync(`${command} --version`, { stdio: "ignore" });
        return true;
    } catch {
        return false;
    }
}

//This function installs a CLI tool if missing
function installCLI(tool) {
    console.log(`\n⚙️ Installing ${tool} CLI...`);
    try {
        execSync(`npm install -g ${tool}`, { stdio: "inherit" });
        console.log(`✅ ${tool} installed successfully!\n`);
    } catch (error) {
        console.error(`❌ Failed to install ${tool} globally. Trying with npx...`);
        global.useNpx = true;
    }
}

//This function detects available platforms
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

//This function prompts the user for platform selection
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

    const choice = global.readline.question("\nEnter the number of your choice: ").trim();

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

//This function deploys based on selected platform
function deploy() {
    let platform = detectPlatform();
    if (!platform) {
        platform = selectPlatform();
    }

    console.log(`\n🚀 Deploying to ${platform}...\n`);

    // This ensures the required CLI tool is installed before deployment
    const cliCommands = {
        "netlify": "netlify",
        "vercel": "vercel",
        "firebase": "firebase",
        "cloudflare": "wrangler",
        "surge": "surge",
        "railway": "railway",
        "koyeb": "koyeb"
    };

    if (cliCommands[platform] && !isCLIInstalled(cliCommands[platform])) {
        installCLI(cliCommands[platform]);
    }

    try {
        const useNpx = global.useNpx ? "npx " : "";

        switch (platform) {
            case "netlify":
                execSync(`${useNpx}netlify deploy --prod`, { stdio: "inherit" });
                break;
            case "vercel":
                execSync(`${useNpx}vercel deploy --prod --yes`, { stdio: "inherit" });
                break;
            case "firebase":
                execSync(`${useNpx}firebase deploy`, { stdio: "inherit" });
                break;
            case "github":
                execSync("git push origin main", { stdio: "inherit" });
                console.log("🎉 GitHub Pages will auto-deploy your project.");
                break;
            case "cloudflare":
                execSync(`${useNpx}wrangler pages publish ./ --project-name=my-project`, { stdio: "inherit" });
                break;
            case "render":
                console.log("⚠️ Render deploys automatically on Git push.");
                break;
            case "surge":
                execSync(`${useNpx}surge ./`, { stdio: "inherit" });
                break;
            case "railway":
                execSync(`${useNpx}railway up`, { stdio: "inherit" });
                break;
            case "koyeb":
                execSync(`${useNpx}koyeb deploy`, { stdio: "inherit" });
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
