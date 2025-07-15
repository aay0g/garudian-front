# Deploy Updated Firestore Rules

## Steps to Deploy the Updated Rules:

1. **Open Firebase Console:**
   - Go to https://console.firebase.google.com
   - Select your Guardian project

2. **Navigate to Firestore Database:**
   - Click on "Firestore Database" in the left sidebar
   - Click on the "Rules" tab

3. **Copy the Updated Rules:**
   - Open the file `firestore-security-rules.txt` in your project
   - Copy all the content from that file

4. **Paste and Publish:**
   - Paste the rules into the Firebase Console rules editor
   - Click "Publish" to deploy the new rules

## What Changed:

The updated rules now include:
- A helper function `isSuperAdmin()` that checks if the current user has the "Super Admin" role
- Updated user document rules that allow Super Admins to create and modify any user document
- Regular users can still only modify their own user documents

## Important Notes:

- These rules allow Super Admins to create new user documents in Firestore
- The Firebase Auth user creation still requires proper Firebase project configuration
- Make sure Email/Password authentication is enabled in Firebase Console > Authentication > Sign-in method

## If User Creation Still Fails:

1. **Check Firebase Authentication Settings:**
   - Go to Firebase Console > Authentication > Sign-in method
   - Make sure "Email/Password" is enabled

2. **Check Your User Role:**
   - Make sure your user document in Firestore has `role: "Super Admin"`
   - You can check this in Firebase Console > Firestore Database > users collection

3. **Check Browser Console:**
   - Open browser developer tools and check the console for detailed error messages
   - The updated UserService now provides detailed logging

## Testing:

After deploying the rules, try creating a user again. The system will now:
1. Check if you're logged in
2. Verify you have "Super Admin" role
3. Create the Firebase Auth user
4. Create the Firestore user document
5. Provide detailed error messages if anything fails
