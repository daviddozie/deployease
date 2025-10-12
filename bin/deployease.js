#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");

function ensureReadlineSync() {
    try {
        require.resolve("readline-sync");
    } catch (e) {
        console.log("\n⚙️ Installing readline-sync...");
        execSync("npm install readline-sync", { stdio: "inherit" });
        console.log("✔️ readline-sync installed successfully!\n");
    }
    global.readline = require("readline-sync");
}

ensureReadlineSync();

function isCLIInstalled(command) {
    try {
        execSync(`${command} --version`, { stdio: "ignore" });
        return true;
    } catch {
        return false;
    }
}

function installCLI(tool) {
    console.log(`\n⚙️ Installing ${tool} CLI...`);
    try {
        execSync(`npm install -g ${tool}`, { stdio: "inherit" });
        console.log(`✔️ ${tool} installed successfully!\n`);
    } catch (error) {
        console.error(`❌ Failed to install ${tool} globally. Trying with npx...`);
        global.useNpx = true;
    }
}

function createWranglerConfig() {
    const wranglerTomlPath = "wrangler.toml";
    if (!fs.existsSync(wranglerTomlPath)) {
        const useWorkers = global.readline.question("Do you want to deploy to Cloudflare Workers? (yes/no): ").trim().toLowerCase() === "yes";
        
        if (useWorkers) {
            console.log("⚙️ Creating Cloudflare Workers configuration...");
            const wranglerConfig = `
name = "my-cloudflare-project"
type = "javascript"
main = "dist/index.js"
compatibility_date = "2025-02-20"
`;
            fs.writeFileSync(wranglerTomlPath, wranglerConfig);
            console.log("✔️ Created wrangler.toml!");
            return true;
        }
    }
    return fs.existsSync(wranglerTomlPath);
}


function checkAuthentication(platform) {
    const authCommands = {
        "netlify": "netlify status",
        "vercel": "vercel whoami",
        "firebase": "firebase projects:list",
        "cloudflare": "wrangler whoami",
        "railway": "railway whoami",
        "koyeb": "koyeb organization list"
    };

    if (authCommands[platform]) {
        try {
            execSync(authCommands[platform], { stdio: "ignore" });
            return true;
        } catch {
            console.log(`\n🔐 You are not logged into ${platform}. Logging in now...`);
            try {
                execSync(`${platform} login`, { stdio: "inherit" });
                console.log(`✔️ Logged into ${platform} successfully!\n`);
                return true;
            } catch (error) {
                console.error(`❌ Failed to log into ${platform}. Please log in manually using '${platform} login'.`);
                process.exit(1);
            }
        }
    }
    return true;
}

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

function selectPlatform() {
    console.log("\n📢 Select a deployment platform:");
    console.log("1. Netlify");
    console.log("2. Vercel");
    console.log("3. Firebase");
    console.log("4. GitHub Pages");
    console.log("5. Cloudflare Pages");
    console.log("6. Render");
    console.log("7. Railway");
    console.log("8. Koyeb");

    const choice = global.readline.question("\nEnter the number of your choice: ").trim();

    switch (choice) {
        case "1": return "netlify";
        case "2": return "vercel";
        case "3": return "firebase";
        case "4": return "github";
        case "5": return "cloudflare";
        case "6": return "render";
        case "7": return "railway";
        case "8": return "koyeb";
        default:
            console.log("❌ Invalid choice. Defaulting to Vercel.");
            return "vercel";
    }
}

function setupFirebase() {
    console.log("\n⚙️ Setting up Firebase Hosting...");

    const projectId = global.readline.question("Enter your Firebase project ID: ").trim();
    if (!projectId) {
        console.error("❌ Firebase project ID is required.");
        process.exit(1);
    }

    try {
        console.log("⚙️ Initializing Firebase in the project...");

        execSync(`firebase use --add ${projectId}`, { stdio: "inherit" });

        const firebaseConfig = {
            hosting: {
                public: "public",
                ignore: ["firebase.json", "**/.*", "**/node_modules/**"],
                rewrites: [{ source: "**", destination: "/index.html" }]
            }
        };

        fs.writeFileSync("firebase.json", JSON.stringify(firebaseConfig, null, 2));

        if (!fs.existsSync("public")) {
            fs.mkdirSync("public");
            fs.writeFileSync("public/index.html", "<h1>Firebase Hosting Setup</h1>");
        }

        console.log("✔️ Firebase setup completed!");

    } catch (error) {
        console.error("❌ Firebase setup failed. Please run 'firebase init hosting' manually.");
        process.exit(1);
    }
}

function deploy() {
    let platform = detectPlatform();
    if (!platform) {
        platform = selectPlatform();
    }

    console.log(`\n🚀 Deploying to ${platform}...\n`);

    const cliCommands = {
        "netlify": "netlify",
        "vercel": "vercel",
        "firebase": "firebase",
        "cloudflare": "wrangler",
        "railway": "railway",
        "koyeb": "koyeb",
        "github": "gh-pages",
        "render": null
    };
    
    if (platform === "github") {
        console.log("⚙️ Deploying to GitHub Pages...");
        try {
            if (!fs.existsSync("node_modules/gh-pages")) {
                console.log("📦 Installing gh-pages...");
                execSync("npm install gh-pages", { stdio: "inherit" });
            }
            
            const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
            if (!packageJson.scripts || !packageJson.scripts.deploy) {
                console.log("⚙️ Adding deploy script to package.json...");
                packageJson.scripts = {
                    ...packageJson.scripts,
                    "deploy": "gh-pages -d build"
                };
                fs.writeFileSync("package.json", JSON.stringify(packageJson, null, 2));
            }
    
            console.log("⚙️ Building project...");
            execSync("npm run build", { stdio: "inherit" });
    
            console.log("🚀 Deploying to GitHub Pages...");
            execSync("npm run deploy", { stdio: "inherit" });
    
            console.log("🎉 Successfully deployed to GitHub Pages!");
        } catch (error) {
            console.error(`❌ GitHub Pages deployment failed: ${error.message}`);
            process.exit(1);
        }
        return;
    }
    
    if (platform === "render") {
    console.log("\n 📢 Render Deployment Requires this project git repository to be connected to Render");
    console.log("\n Follow these steps to continue:");
    console.log("1. Go to https://dashboard.render.com/ and log in.");
    console.log("2. Click 'New' and select 'Web Service'.");
    console.log("3. Set the build command (if applicable) and environment variables.");
    console.log("4. Connect your GitHub repository and complete the setup.");
    console.log("5. Click 'Create Web Service' and wait for the first deployment.");
    console.log("6. Once done, return here and run the script again.\n");

    try {
        execSync("git rev-parse --is-inside-work-tree", { stdio: "ignore" });
        console.log("✅ Git Repository Detected.");

        const remoteOutput = execSync("git remote -v").toString().trim();
        if (!remoteOutput) {
            console.error("❌ No remote repository detected. Please connect this repo to GitHub first.");
            process.exit(1);
        }

        console.log("🔄 Checking for uncommitted changes...");
        const status = execSync("git status --porcelain").toString().trim();

        if (status) {
            console.log("⚠️ Uncommitted changes detected.");
            const confirmCommit = global.readline.question("Do you want to commit and push them? (yes/no): ").trim().toLowerCase();

            if (confirmCommit === "yes") {
                console.log("⚙️ Committing changes...");
                execSync("git add . && git commit -m 'deploying to Render using DeployEase'", { stdio: "ignore" });
                console.log("✅ Changes committed.");
            } else {
                console.log("❌ Deployment aborted. Please commit your changes manually.");
                process.exit(1);
            }
        }

        console.log("🦾 Pushing to GitHub...");
        execSync("git push", { stdio: "inherit" });

        console.log("✅ Successfully pushed to GitHub. Render will automatically deploy the changes.");
    } catch (error) {
        //console.error("❌ An error occurred:", error.message);
        process.exit(1);
    }

    return;
}
    
    if (platform === "cloudflare") {
    console.log("⚙️ Deploying to Cloudflare...");

    let isWorker = createWranglerConfig();

    try {
        if (isWorker) {
            console.log("🚀 Deploying to Cloudflare Workers...");
            execSync("wrangler deploy", { stdio: "inherit" });
        } else {
            console.log("\n📢 Deploying to Cloudflare Pages...");
            const directory = global.readline.question("Enter the directory to publish (default: ./public): ").trim() || "./public";

            if (!fs.existsSync(directory)) {
                console.error(`❌ The directory '${directory}' does not exist.`);
                process.exit(1);
            }

            console.log(`🚀 Deploying to Cloudflare Pages from '${directory}'...`);
            execSync(`wrangler pages publish ${directory}`, { stdio: "inherit" });
        }

        console.log("🎉 Successfully deployed to Cloudflare!");
    } catch (error) {
        console.error(`❌ Cloudflare deployment failed: ${error.message}`);
        process.exit(1);
    }
}
    
    

    if (cliCommands[platform] && !isCLIInstalled(cliCommands[platform])) {
        installCLI(cliCommands[platform]);
    }

    if (!checkAuthentication(platform)) {
        console.error("❌ Authentication failed. Please log in manually.");
        process.exit(1);
    }

    if (platform === "firebase") {
        setupFirebase();
    }

    try {
        const useNpx = global.useNpx ? "npx " : "";
        execSync(`${useNpx}${cliCommands[platform]} deploy`, { stdio: "inherit" });
    } catch (error) {
        console.error(`❌ Deployment failed: ${error.message}`);
    }
}

if (process.argv[2] === "deploy") {
    deploy();
} else {
    console.log("Usage: deployease deploy");
}
