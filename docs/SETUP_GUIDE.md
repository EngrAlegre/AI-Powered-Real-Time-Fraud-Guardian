# Setup Guide - AI-Powered Real-Time Fraud Guardian

This guide will help you set up and run the fraud detection platform locally and prepare it for the Huawei Developer Competition 2025.

---

## 🚀 Quick Start (5 Minutes)

### 1. Prerequisites

- **Node.js**: v20.0.0 or higher
- **npm**: v10.0.0 or higher (comes with Node.js)
- **Git**: For version control
- **Code Editor**: VS Code recommended

### 2. Clone & Install

```bash
# Clone the repository
git clone <your-repository-url>
cd Fraud

# Install dependencies
npm install
```

### 3. Configure Environment

```bash
# Copy the Huawei environment template
cp HUAWEI_ENV_TEMPLATE.txt .env.local
```

**Edit `.env.local` with your credentials:**

**Minimum Required (Demo Mode)**:
```env
# Firebase (Required for app to work)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Google AI (for fallback)
GOOGLE_GENAI_API_KEY=your_google_ai_key
```

**Full Setup (Production with Huawei)**:
Add these additional variables:
```env
# Huawei Cloud
HUAWEI_CLOUD_REGION=ap-southeast-1
HUAWEI_CLOUD_ACCESS_KEY_ID=your_access_key
HUAWEI_CLOUD_SECRET_ACCESS_KEY=your_secret_key
HUAWEI_CLOUD_PROJECT_ID=your_project_id

# Pangu Models
HUAWEI_PANGU_ENDPOINT=https://pangu.ap-southeast-1.myhuaweicloud.com
HUAWEI_PANGU_MODEL_ID=fraud-detection-v1

# ModelArts
HUAWEI_MODELARTS_ENDPOINT=https://modelarts.ap-southeast-1.myhuaweicloud.com
HUAWEI_OBS_ENDPOINT=https://obs.ap-southeast-1.myhuaweicloud.com
```

### 4. Run the Application

```bash
# Start development server
npm run dev
```

Open [http://localhost:9002](http://localhost:9002) in your browser.

---

## 🔐 Getting Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Click "Project Settings" (gear icon)
4. Scroll to "Your apps" section
5. Click "Web app" or add new web app
6. Copy all configuration values to `.env.local`

### Enable Authentication

1. In Firebase Console, go to "Authentication"
2. Click "Get Started"
3. Enable "Email/Password" provider
4. Create test user for login

---

## ☁️ Getting Huawei Cloud Credentials

### Step 1: Create Huawei Cloud Account

1. Go to [Huawei Cloud](https://www.huaweicloud.com)
2. Register for competition account
3. Complete verification
4. Access [Competition Resources](https://competition.intl.huaweicloud.com/intl/en-us/information/1201724800/llm-resources)

### Step 2: Get Access Keys

1. Log in to [Huawei Cloud Console](https://console.huaweicloud.com)
2. Click your username → **My Credentials**
3. Go to **Access Keys** tab
4. Click **Create Access Key**
5. **Download and save** the CSV file (contains both access key ID and secret)
6. Copy to `.env.local`:
   - `HUAWEI_CLOUD_ACCESS_KEY_ID` = Access Key Id from CSV
   - `HUAWEI_CLOUD_SECRET_ACCESS_KEY` = Secret Access Key from CSV

### Step 3: Get Project ID

1. In Huawei Cloud Console, click **Projects** dropdown (top-right)
2. Copy your **Project ID**
3. Add to `.env.local`: `HUAWEI_CLOUD_PROJECT_ID=your_project_id`

### Step 4: Enable Required Services

#### Enable Pangu Models

1. Go to **AI Gallery** in Huawei Console
2. Search for "Pangu" models
3. Subscribe to fraud detection or general Pangu model
4. Note the **Model ID**
5. Add to `.env.local`: `HUAWEI_PANGU_MODEL_ID=your_model_id`

#### Enable ModelArts

1. Go to **ModelArts** service
2. Click **Enable Service**
3. Accept terms and conditions
4. Wait for activation (takes 1-2 minutes)
5. Default endpoint: `https://modelarts.ap-southeast-1.myhuaweicloud.com`

#### Enable OBS (Object Storage)

1. Go to **OBS** (Object Storage Service)
2. Click **Create Bucket**
3. Name: `fraud-guardian-data`
4. Region: Same as your project (e.g., `ap-southeast-1`)
5. Click **Create**
6. Upload sample training data (optional)

---

## 🏃 Running the Application

### Development Mode

```bash
# Run Next.js dev server with hot reload
npm run dev
```

**Features**:
- Hot module reloading
- Fast refresh
- Error overlay
- Development optimizations

**URL**: http://localhost:9002

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Genkit AI Tools (Optional)

```bash
# Run Genkit developer UI
npm run genkit:dev

# Or with watch mode
npm run genkit:watch
```

**Features**:
- Test AI flows directly
- View flow traces
- Debug prompts
- Monitor performance

**URL**: http://localhost:4000

---

## 🧪 Testing the Application

### 1. Login

- Go to http://localhost:9002/login
- Use test credentials or sign up
- Or use the signup page

### 2. Test Dashboard

- Navigate to Dashboard
- Verify Huawei service badges are visible
- Check "Powered by Huawei Cloud" branding
- Review service status card

### 3. Test Explainable AI

1. Go to Dashboard
2. Find "AI Decision Explanation" card
3. Enter transaction ID: `TXN-20250116-8500`
4. Click "Explain"
5. Verify:
   - ✅ Risk score displays
   - ✅ Risk factors listed
   - ✅ Pangu Model Analysis shown
   - ✅ Confidence level present
   - ✅ Alternative scenarios listed

### 4. Test Model Management

1. Go to Model Management page
2. Fill in training form:
   - Training Data Path: `obs://fraud-guardian-data/training-data/`
   - Model Name: `fraud-detector-test`
   - Description: `Test model training`
3. Click "Start Training Job"
4. Verify job ID returned

### 5. Test Transactions Page

- View transaction list
- Check risk scores
- Filter by risk level
- Click transaction for details

---

## 🐛 Troubleshooting

### Issue: "Module not found" errors

**Solution**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: Port 9002 already in use

**Solution**:
```bash
# Use different port
npm run dev -- -p 3000
```

Or kill process using port 9002:
```bash
# Windows
netstat -ano | findstr :9002
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:9002 | xargs kill -9
```

### Issue: Firebase initialization errors

**Check**:
1. All Firebase env variables are set in `.env.local`
2. Variables start with `NEXT_PUBLIC_` (required for Next.js)
3. No extra quotes around values
4. Restart dev server after changing `.env.local`

### Issue: Huawei services show "disconnected"

**This is OK for demo!** The app works in two modes:

**Mode 1**: Huawei services configured
- Uses Pangu Models for AI
- Uses ModelArts for training
- Shows "connected" status

**Mode 2**: Huawei services not configured (Fallback)
- Uses Google Gemini via Genkit
- Uses mock training responses
- Shows "disconnected" but still demonstrates features
- Perfect for development and testing

**To fix (optional)**:
1. Verify Huawei credentials in `.env.local`
2. Check access key has correct permissions
3. Ensure services are enabled in Huawei Console
4. Restart dev server

### Issue: Build fails with TypeScript errors

**Solution**:
```bash
# Check for errors
npm run typecheck

# Fix common issues
# - Add missing type imports
# - Check for unused variables
# - Verify prop types match
```

### Issue: Styles not loading

**Solution**:
```bash
# Rebuild Tailwind
npm run dev

# Clear Next.js cache
rm -rf .next
npm run dev
```

---

## 📁 Project Structure Reference

```
Fraud/
├── src/
│   ├── ai/                     # AI flows and Genkit config
│   ├── app/                    # Next.js app router pages
│   ├── components/             # React components
│   │   ├── huawei/            # Huawei branding components
│   │   ├── dashboard/         # Dashboard features
│   │   └── ui/                # Base UI components
│   ├── lib/
│   │   ├── huawei/            # Huawei Cloud services
│   │   └── utils.ts           # Utility functions
│   └── firebase/              # Firebase configuration
├── docs/
│   ├── SETUP_GUIDE.md         # This file
│   ├── HUAWEI_INTEGRATION.md  # Integration details
│   ├── DEMO_SCRIPT.md         # Demo video script
│   └── REVISED_IMPLEMENTATION_PLAN.md
├── HUAWEI_ENV_TEMPLATE.txt    # Environment variables template
├── package.json               # Dependencies and scripts
└── .env.local                 # Your local configuration (create this)
```

---

## 🎬 Preparing for Demo

### Before Recording

1. **Clean Browser**:
   - Clear cache and cookies
   - Close unnecessary tabs
   - Disable browser extensions
   - Use incognito/private mode

2. **Test Run**:
   - Go through complete demo flow
   - Verify all features work
   - Check loading times
   - Note any delays

3. **Screen Recording**:
   - Set resolution to 1920x1080
   - Close unnecessary apps
   - Hide desktop icons
   - Use clean background
   - Test microphone audio

4. **Sample Data**:
   - Have transaction IDs ready
   - Prepare training data paths
   - Know what each demo shows

### Sample Transaction IDs

Pre-configured IDs that work well for demo:

- **High Risk**: `TXN-20250116-8500` (87/100)
- **Medium Risk**: `TXN-20250116-4200` (56/100)
- **Low Risk**: `TXN-20250116-0850` (23/100)

### Demo Checklist

- [ ] Application running on http://localhost:9002
- [ ] Logged in as demo user
- [ ] Dashboard page loads correctly
- [ ] All Huawei badges visible
- [ ] Service status card shows correct states
- [ ] Transaction IDs ready
- [ ] Demo script printed/on second screen
- [ ] Screen recorder ready
- [ ] Microphone tested
- [ ] 3-minute timer ready

---

## 📦 Deployment (Optional)

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
```

### Deploy to Huawei Cloud

1. Build application:
```bash
npm run build
```

2. Upload to Huawei Cloud hosting
3. Configure environment variables
4. Set up domain

---

## 🔄 Updating Dependencies

```bash
# Check for updates
npm outdated

# Update specific package
npm update <package-name>

# Update all (careful!)
npm update

# Update Next.js
npm install next@latest react@latest react-dom@latest
```

---

## 📚 Additional Resources

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [Firebase Docs](https://firebase.google.com/docs)
- [Huawei Cloud Docs](https://support.huaweicloud.com)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)

### Project Docs
- `HUAWEI_INTEGRATION.md` - Integration guide
- `DEMO_SCRIPT.md` - 3-minute demo script
- `REVISED_IMPLEMENTATION_PLAN.md` - Architecture

### Support
- Check existing issues in repository
- Review competition forums
- Huawei Cloud support portal
- Firebase community

---

## ✅ Pre-Submission Checklist

- [ ] Application runs without errors
- [ ] All pages load correctly
- [ ] Authentication works
- [ ] Explainable AI card functions
- [ ] Model management features work
- [ ] Huawei branding visible throughout
- [ ] Demo script tested
- [ ] 3-minute video recorded
- [ ] Code is clean and commented
- [ ] README updated
- [ ] Environment variables documented
- [ ] No sensitive data in code
- [ ] Build succeeds (`npm run build`)
- [ ] Types check (`npm run typecheck`)

---

## 🎉 Ready to Go!

You should now have:
- ✅ Application running locally
- ✅ Firebase authentication working
- ✅ Huawei Cloud services integrated (or fallback mode)
- ✅ All features tested
- ✅ Ready for demo recording

**Next Steps**:
1. Review `DEMO_SCRIPT.md` for video recording
2. Practice the 3-minute demo
3. Record and submit!

Good luck with the Huawei Developer Competition 2025! 🚀

