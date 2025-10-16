# 🔐 Environment Setup - Quick Guide

## ⚡ Quick Setup (2 Minutes)

### Step 1: Create .env.local file

```bash
# Copy the template
cp ENV_TEMPLATE.txt .env.local
```

### Step 2: Fill in REQUIRED values

Open `.env.local` and add these **REQUIRED** credentials:

#### Firebase (Required for app to work)
```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

**Get from**: [Firebase Console](https://console.firebase.google.com) → Project Settings → Your apps

#### Google AI (Required for AI fallback)
```env
GOOGLE_GENAI_API_KEY=AIza...
```

**Get from**: [Google AI Studio](https://makersuite.google.com/app/apikey)

### Step 3: (Optional) Add Huawei credentials

If you have Huawei Cloud access:

```env
HUAWEI_CLOUD_ACCESS_KEY_ID=your_key
HUAWEI_CLOUD_SECRET_ACCESS_KEY=your_secret
HUAWEI_CLOUD_PROJECT_ID=your_project
HUAWEI_PANGU_MODEL_ID=fraud-detection-v1
```

**Get from**: [Huawei Console](https://console.huaweicloud.com) → My Credentials → Access Keys

### Step 4: Run the app

```bash
npm run dev
```

Open [http://localhost:9002](http://localhost:9002)

---

## 🎯 What You Need For Different Scenarios

### Minimum (Development/Testing)
- ✅ Firebase credentials (6 values)
- ✅ Google AI key (1 value)
- ✅ **Total: 7 values**
- ⏱️ **Time: 10 minutes to get**

**Result**: App works fully with fallback AI

### Full Production (Competition)
- ✅ Everything above PLUS
- ✅ Huawei Cloud credentials (4 values)
- ✅ Huawei Pangu Model ID (1 value)
- ✅ **Total: 12 values**
- ⏱️ **Time: 30-60 minutes to get**

**Result**: App uses Huawei Pangu Models for AI

---

## 🔒 Security Notes

- ✅ `.env.local` is already in `.gitignore` (won't be committed)
- ✅ Never share your `.env.local` file
- ✅ Never commit credentials to git
- ✅ Use different keys for development and production

---

## 🐛 Troubleshooting

**Q: App won't start?**
- Check all REQUIRED values are filled in
- Make sure no extra spaces in values
- Restart dev server after changing .env.local

**Q: Firebase error?**
- Verify all 6 Firebase values are correct
- Check Firebase project is active
- Enable Email/Password auth in Firebase Console

**Q: Huawei services show disconnected?**
- This is OK! App works in fallback mode
- To connect: Add Huawei credentials to .env.local

---

## ✅ Quick Checklist

- [ ] Created `.env.local` from template
- [ ] Added Firebase credentials (6 values)
- [ ] Added Google AI key (1 value)
- [ ] Optionally added Huawei credentials
- [ ] Saved file
- [ ] Restarted dev server
- [ ] App loads successfully
- [ ] **Ready to demo! 🎉**

---

## 📞 Need Help?

See `docs/SETUP_GUIDE.md` for detailed instructions on getting each credential.

