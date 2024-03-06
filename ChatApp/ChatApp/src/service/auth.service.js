import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, getAuth, updateEmail } from 'firebase/auth';
import { auth } from '../config/firebase-config';
import { storage } from '../config/firebase-config';
import { uploadBytes, ref as storageRef, getDownloadURL } from "firebase/storage";
import { updateUserData, getUserByEmail } from './users.service';

export const registerUser = (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const loginUser = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const logoutUser = () => {
  return signOut(auth);
};

export const updateUserEmail = async (newEmail) => {
  const user = getAuth().currentUser;

  try {
    await updateEmail(user, newEmail);
    console.log('Email updated successfully.');
    return true;
  } catch (error) {
    console.error('Error updating email:', error);
    return false;
  }
};


export const sendFriendRequest = async (senderUid, recipientEmail) => {
  try {
    // Get the user by email
    const userByEmailSnapshot = await getUserByEmail(recipientEmail);
    const userByEmail = userByEmailSnapshot.val();

    if (userByEmail) {
      const recipientUid = userByEmail.uid;

      // Add the sender's ID to the recipient's pendingRequests
      const updatedPendingRequests = [...userByEmail.pendingRequests, senderUid];
      await updateUserData(recipientUid, { pendingRequests: updatedPendingRequests });

      console.log('Friend request sent successfully.');
    } else {
      console.log('User not found with the provided email.');
    }
  } catch (error) {
    console.error('Error sending friend request:', error);
  }
};

// Storage
// uploadProfileImage
export async function uploadProfileImage(file, user, setLoading) {
  const fileRef = storageRef(storage, user.uid + '.png');

  setLoading(true);

  try {
    await uploadBytes(fileRef, file);

    const photoURL = await getDownloadURL(fileRef);

    console.log(user)
    await updateUserData(user.uid, { profilePhotoURL: photoURL });

    setLoading(false);
    alert('Profile image uploaded successfully.');
    return photoURL;
  } catch (error) {
    console.error("Error uploading profile image:", error);
    setLoading(false);
  }
}

// uploadFile
export async function uploadFile(file, user, setLoading) {
  const fileRef = storageRef(storage, user.uid + '/' + file.name);

  setLoading(true);

  try {
    await uploadBytes(fileRef, file);

    const fileURL = await getDownloadURL(fileRef);

    await updateUserData(user.uid, { fileURL: fileURL });

    setLoading(false);
    alert('File uploaded successfully.');
    return fileURL;
  } catch (error) {
    console.error("Error uploading file:", error);
    setLoading(false);
  }
}