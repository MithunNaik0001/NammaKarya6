# User Authentication & Data Management

## Overview
The application now implements user-specific data management where each logged-in user (via Gmail/Firebase Auth) can only see and manage their own data across all features.

## How It Works

### 1. Authentication
- Users sign in with Gmail through Firebase Authentication
- The `useAuth` hook provides access to the current user's information across components
- Location: `src/hooks/use-auth.ts`

### 2. Data Storage
All user data is stored in Firestore with the following collections:

- **`orders`** - Payment orders and history (filtered by `userId`)
- **`seeker-proffessian`** - Job seeker preferences (filtered by `createdBy`)
- **`candidate-requermen`** - Candidate requirements (filtered by `createdBy`)
- **`proffessional`** - Professional profiles (filtered by `createdBy`)
- **`users`** - User profile data (filtered by user ID document)

### 3. Firestore Security Rules
Located in `firestore.rules`, these rules ensure:
- Users can only create documents with their own UID
- Users can only read/update/delete their own documents
- Some collections allow public read access for discovery features

### 4. API Authentication
API routes now require `x-user-id` header:

**Example:**
```typescript
const res = await fetch('/api/orders', {
    headers: {
        'x-user-id': user.uid,
    },
});
```

### 5. Updated Files

#### Core Library
- **`src/lib/orders.ts`** - Migrated from file storage to Firestore with user filtering
- **`src/hooks/use-auth.ts`** - NEW: Reusable authentication hook

#### API Routes
- **`src/app/api/orders/route.ts`** - Filters orders by authenticated user
- **`src/app/api/create-order/route.ts`** - Associates orders with user ID

#### Pages
- **`src/app/payment-history/page.tsx`** - Shows only current user's payment history
- **`src/app/seeker-professional/page.tsx`** - Saves preferences with user ID
- **`src/app/seeker-requirement/page.tsx`** - Saves requirements with user ID

## Usage in New Pages

To add user-specific data to a new page:

### 1. Use the Auth Hook
```typescript
import { useAuth } from '@/hooks/use-auth';

export default function MyPage() {
    const { user, loading, userId } = useAuth();
    
    if (loading) return <div>Loading...</div>;
    if (!user) return <div>Please sign in</div>;
    
    // Use userId to fetch/save data
}
```

### 2. Fetch User-Specific Data
```typescript
async function fetchMyData() {
    if (!userId) return;
    
    const q = query(
        collection(db, 'my-collection'),
        where('createdBy', '==', userId)
    );
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => doc.data());
}
```

### 3. Save with User ID
```typescript
async function saveData(formData) {
    await addDoc(collection(db, 'my-collection'), {
        ...formData,
        createdBy: userId,
        createdAt: new Date().toISOString(),
    });
}
```

## Security Best Practices

1. **Always validate userId on the backend** - Never trust client-sent user IDs without verification
2. **Use Firestore Security Rules** - Add rules for every new collection
3. **Test with different users** - Ensure data isolation works correctly
4. **Handle unauthenticated states** - Show appropriate UI when user is not logged in

## Testing

1. Sign in with one Gmail account
2. Create some data (orders, preferences, etc.)
3. Sign out
4. Sign in with a different Gmail account
5. Verify you cannot see the first user's data
6. Create data with second account
7. Sign back in with first account
8. Verify you only see your own data

## Troubleshooting

**Issue: "Missing or insufficient permissions"**
- Solution: Check Firestore rules are deployed
- Solution: Verify `x-user-id` header is being sent
- Solution: Ensure user is authenticated before making requests

**Issue: "Authentication required" error**
- Solution: Check user is signed in via Firebase Auth
- Solution: Verify `auth.currentUser` exists before API calls

**Issue: Seeing other users' data**
- Solution: Check Firestore query includes `where('userId', '==', userId)`
- Solution: Verify security rules are properly filtering by user ID
