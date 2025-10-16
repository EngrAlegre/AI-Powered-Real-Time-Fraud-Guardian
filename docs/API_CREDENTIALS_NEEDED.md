# API Credentials Needed

## 🔑 What I Need From You

To fully configure your fraud detection platform, please provide the following credentials. Copy this template and fill in your values.

---

## ✅ REQUIRED (App won't work without these)

### 1. Firebase Configuration

Get from: https://console.firebase.google.com → Project Settings → Your apps → Web app

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

### 2. Google AI API Key (for fallback AI)

Get from: https://makersuite.google.com/app/apikey

```env
GOOGLE_GENAI_API_KEY=
```

---

## ⭐ OPTIONAL (For full Huawei integration - highly recommended for competition)

### 3. Huawei Cloud Core Credentials

Get from: https://console.huaweicloud.com → My Credentials → Access Keys

```env
HUAWEI_CLOUD_REGION=ap-southeast-1
HUAWEI_CLOUD_ACCESS_KEY_ID=
HUAWEI_CLOUD_SECRET_ACCESS_KEY=
HUAWEI_CLOUD_PROJECT_ID=
```

**How to get**:
1. Login to Huawei Cloud Console
2. Click your username (top-right) → "My Credentials"
3. Go to "Access Keys" tab
4. Click "Create Access Key"
5. Download CSV file with keys
6. Copy Access Key Id and Secret Access Key

### 4. Pangu Models Configuration

```env
HUAWEI_PANGU_ENDPOINT=https://pangu.ap-southeast-1.myhuaweicloud.com
HUAWEI_PANGU_MODEL_ID=fraud-detection-v1
```

**How to get**:
1. Go to Huawei AI Gallery
2. Search for "Pangu" models
3. Subscribe to fraud detection or general Pangu model
4. Copy model ID from subscription

### 5. ModelArts Configuration

```env
HUAWEI_MODELARTS_ENDPOINT=https://modelarts.ap-southeast-1.myhuaweicloud.com
HUAWEI_OBS_ENDPOINT=https://obs.ap-southeast-1.myhuaweicloud.com
```

**How to get**:
1. Go to ModelArts service in console
2. Click "Enable Service"
3. Endpoints are usually region-based (shown above for ap-southeast-1)

---

## 📋 Quick Copy Template

Copy everything below and fill in your values:

```env
# ==========================================
# REQUIRED - Firebase Configuration
# ==========================================
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# ==========================================
# REQUIRED - Google AI (Fallback)
# ==========================================
GOOGLE_GENAI_API_KEY=

# ==========================================
# OPTIONAL - Huawei Cloud (Recommended)
# ==========================================
HUAWEI_CLOUD_REGION=ap-southeast-1
HUAWEI_CLOUD_ACCESS_KEY_ID=
HUAWEI_CLOUD_SECRET_ACCESS_KEY=
HUAWEI_CLOUD_PROJECT_ID=

HUAWEI_PANGU_ENDPOINT=https://pangu.ap-southeast-1.myhuaweicloud.com
HUAWEI_PANGU_MODEL_ID=

HUAWEI_MODELARTS_ENDPOINT=https://modelarts.ap-southeast-1.myhuaweicloud.com
HUAWEI_OBS_ENDPOINT=https://obs.ap-southeast-1.myhuaweicloud.com
```

---

## 🎯 What Happens With Each Option

### With Only Firebase + Google AI (Minimum)
✅ App works fully  
✅ Authentication works  
✅ Fraud detection works (rule-based + Gemini AI)  
✅ All UI features work  
✅ Perfect for development and testing  
🔴 Service status shows "disconnected" for Huawei  
🔴 Uses Genkit instead of Pangu  
🔴 Mock ModelArts responses  

### With Firebase + Google AI + Huawei (Full)
✅ Everything above PLUS:  
✅ Real Pangu Models AI reasoning  
✅ Real ModelArts training jobs  
✅ Service status shows "connected"  
✅ Full competition-ready demo  
✅ Production-grade integration  
⭐ Maximum competition points  

---

## 🚀 How to Send Me Credentials

### Option 1: Secure Message
Send credentials via secure channel (not public repository)

### Option 2: I'll Configure
1. Send me the credentials
2. I'll create `.env.local` file
3. I'll test everything works
4. Ready to demo!

### Option 3: Self-Configure
1. Copy the template above
2. Fill in your values
3. Save as `.env.local` in project root
4. Restart dev server: `npm run dev`
5. Test on http://localhost:9002

---

## 🔒 Security Notes

- **NEVER commit `.env.local` to git** (already in .gitignore)
- **Keep credentials private** - don't share publicly
- **Use different keys** for development and production
- **Rotate keys regularly** after competition
- **Delete competition keys** after submission if temporary

---

## ⏱️ Timeline

### If you have credentials now:
- ⚡ 5 minutes to configure
- ⚡ Ready to demo immediately

### If you need to get credentials:
- 🕐 Firebase: 5-10 minutes (sign up + create project)
- 🕐 Google AI: 2 minutes (just enable API)
- 🕐 Huawei Cloud: 30-60 minutes (account setup + enable services)

---

## ❓ Questions?

**Q: I don't have Huawei credentials yet. Can I still demo?**  
A: Yes! App works perfectly without them. Get them later for production.

**Q: Where do I put these credentials?**  
A: In a file called `.env.local` in the project root directory (same level as package.json).

**Q: Are Huawei credentials free?**  
A: Competition participants get free credits. Check competition resources page.

**Q: Can I use different regions?**  
A: Yes, but update endpoints to match your region (e.g., us-east-1, eu-west-1).

**Q: What if my credentials don't work?**  
A: Check:
1. All values are copied correctly (no extra spaces)
2. Environment variables have correct prefixes
3. Dev server was restarted after adding credentials
4. Services are enabled in respective consoles

---

## 📞 Next Steps

1. ✅ Gather credentials using guides above
2. ✅ Send to me or configure yourself
3. ✅ Test application
4. ✅ Record demo video
5. ✅ Submit to competition!

---

**Ready when you are! Send me the credentials and I'll get everything configured.** 🚀

