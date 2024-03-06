import { get, set, ref, query, equalTo, orderByChild, update, getDatabase, push, child } from 'firebase/database';
import { db } from '../config/firebase-config';
import { format } from 'date-fns';
import { auth } from '../config/firebase-config';

export const getAllUsers = async () => {
  const snapshot = await get(query(ref(db, "users")));
  if (!snapshot.exists()) {
      return [];
  }
  const users = Object.keys(snapshot.val()).map((key) => ({
      id: key,
      ...snapshot.val()[key],
  }));

  return users;
}

export const getUserByUid = (uid) => {
  return get(ref(db, `users/${uid}`));
};

export const createUserProfile = (uid, username, email, phoneNumber, password, role = 'user', status, friendsList, sentRequests, pendingRequests ) => {
  const readableDate = format(new Date(), 'yyyy-MM-dd HH:mm:ss');

  return set(ref(db, `users/${uid}`), {
    uid,
    username,
    email,
    password,
    phoneNumber,
    createdOnReadable: readableDate,
    role,
    status,
    friendsList,
    sentRequests,
    pendingRequests,
    profilePhotoURL: '',
    fileURL: '',
    location: '',
  });
};

export const getUserData = (uid) => {
  return get(query(ref(db, 'users'), orderByChild('uid'), equalTo(uid)));
};

export const updateUserData = async (uid, data) => {
  const userRef = ref(db, `users/${uid}`);

  try {
    await update(userRef, data);
    console.log("User data updated successfully.");
  } catch (error) {
    console.error("Error updating user data:", error);
    throw error;
  }
};

export const getUserByEmail = async (email) => {
  try {
    const userSnapshot = await get(
      query(ref(db, 'users'), orderByChild('email'), equalTo(email))
    );
    return userSnapshot;
  } catch (error) {
    console.error('Error getting user by email:', error.message);
    throw error;
  }
};
