# GaussDB Setup - Step by Step Guide

## What You Need to Do in Huawei Cloud Console

### Step 1: Find Your GaussDB Instance
1. Log in to **Huawei Cloud Console**: https://console-intl.huaweicloud.com/
2. Search for "**GaussDB**" or "**RDS**" in the search bar
3. Click on your database instance (it should be running/available)

### Step 2: Get Public Access (EIP)
**Why?** So your local computer can connect to the database.

1. Click on your GaussDB instance name
2. Look for one of these options:
   - **"Bind EIP"** button
   - **"Public Network Access"** tab/section
   - **"Connection Management"** → "Public Access"

3. Click "**Bind EIP**" or "**Enable Public Access**"
   - Choose "**Automatically assign**" if you don't have an EIP
   - Or select an existing EIP if you have one
   - Click "OK" or "Submit"

4. **Copy the Public IP Address** (EIP)
   - It looks like: `123.45.67.89`
   - This is what you'll use to connect!

### Step 3: Configure Security Group
**Why?** To allow your computer to access port 5432.

1. In your GaussDB instance page, find "**Security Group**"
2. Click on the security group name (it will open security group settings)
3. Go to "**Inbound Rules**" tab
4. Click "**Add Rule**"
5. Fill in:
   - **Protocol & Port**: `TCP` / `5432`
   - **Source**: Choose one:
     - **Your IP only** (most secure): Put your computer's public IP
       - Find your IP: https://whatismyipaddress.com/
     - **Any IP** (for testing): `0.0.0.0/0` ⚠️ Only for development!
   - **Description**: "PostgreSQL access for dev"
6. Click "**OK**"

### Step 4: Get Connection Details
From your GaussDB instance page, note down:
- ✅ **Public IP (EIP)**: e.g., `123.45.67.89` (you got this in Step 2)
- ✅ **Port**: Usually `5432`
- ✅ **Database Name**: `fraud_guardian` (you set this during creation)
- ✅ **Username**: `root` (default admin user)
- ✅ **Password**: The one you set during instance creation

### Step 5: Update Your `.env` File
Open `d:\Alegre\Hackathon\Fraud\.env` and update:

```env
# Replace this:
HUAWEI_GAUSSDB_ENDPOINT=192.168.0.136:5432

# With your PUBLIC IP (EIP):
HUAWEI_GAUSSDB_ENDPOINT=123.45.67.89:5432

# Make sure these are correct too:
HUAWEI_GAUSSDB_DATABASE=fraud_guardian
HUAWEI_GAUSSDB_USERNAME=root
HUAWEI_GAUSSDB_PASSWORD=YourActualPassword
```

**Important**: Replace `123.45.67.89` with YOUR actual public IP from Step 2!

### Step 6: Test Connection
Run in your terminal:
```bash
npx tsx scripts/test-gaussdb.ts
```

**Expected output**:
```
🔍 Testing GaussDB Connection...
✅ GaussDB connection pool initialized
✅ GaussDB service initialized
📋 Initializing database schema...
✅ Schema initialized successfully
🧪 Testing transaction creation...
✅ Transaction created: TEST-xxxx
📊 Testing transaction retrieval...
✅ Retrieved 1 transaction(s)
📈 Testing statistics query...
✅ Statistics retrieved
🎉 ALL TESTS PASSED!
```

## Troubleshooting

### "Connection timeout"
- Security group doesn't allow port 5432
- EIP not bound correctly
- Wrong IP address in `.env`

### "Authentication failed"
- Wrong username or password in `.env`
- Check password has no special characters that need escaping

### "Database does not exist"
- Wrong database name in `.env`
- Create database: In GaussDB console, run SQL: `CREATE DATABASE fraud_guardian;`

## What If I Can't Get Public Access?

Don't worry! We have fallback options:

1. **Deploy to Huawei Cloud** - Your app will run in the same VPC as GaussDB
2. **Use Mock Mode** - I can add a development mode that simulates GaussDB
3. **Use Firebase for now** - Keep Firebase for local dev, use GaussDB in production

Let me know if you need help with any of these steps! 🚀

