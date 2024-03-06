import React, { useContext, useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AppContext } from '../../appContext/AppContext';
import { auth } from '../../config/firebase-config';
import { useAuthState } from 'react-firebase-hooks/auth';
import { updateUserData, getUserByUid } from '../../service/users.service';
import { get, query, orderByChild, equalTo, ref, update } from 'firebase/database';
import { db } from '../../config/firebase-config';

export function Contacts() {
  const { userData } = useContext(AppContext);
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const [friendRequests, setFriendRequests] = useState([]); // {uid: string, username: string, type: 'sent' | 'received'}
  const [friendsList, setFriendsList] = useState([]);

  // uid, name, type

  useEffect(() => {
    if (!user) return;
  
    const currentUser = getUserByUid(user.uid).then(r => r.val());
  
    currentUser
      .then(user => {
        const sentRequests = user.sentRequests || {};
  
        if (!Array.isArray(sentRequests)) {
          // Convert object to array
          const sentRequestsArray = Object.values(sentRequests);
  
          const sentRequestsPromise = Promise.all(
            sentRequestsArray.map((uid) => getUserByUid(user.uid).then(r => ({ ...r.val(), type: 'sent' })))
          );
  
          return sentRequestsPromise;
        } else {
          return [];
        }
      })
      .then(sentRequestsData => {
        // Handle the case when sentRequestsData is not an array
        if (!Array.isArray(sentRequestsData)) {
          console.error('sentRequestsData is not an array:', sentRequestsData);
          return;
        }
  
        setFriendRequests(sentRequestsData.map(({ uid, username, type }) => ({ uid, username, type })));
      })
      .catch(error => {
        console.error('Error fetching friend requests:', error);
      });
  }, [user]);

  // const [messageInputValue, setMessageInputValue] = useState('');
  const [emailInputValue, setEmailInputValue] = useState('');
  const [isContactModalVisible, setIsContactModalVisible] = useState(false);
  const [pendingRequest, setPendingRequest] = useState(null);

  const toggleModal = () => {
    setIsContactModalVisible(!isContactModalVisible);
  };

  const handleSendInvitation = async () => {
    try {
      const usersSnapshot = await get(query(ref(db, 'users')));
      const users = usersSnapshot.val();

      // Find the user by email locally
      const userByEmail = Object.values(users).find(u => u.email === emailInputValue);

      if (userByEmail) {
        const recipientUid = userByEmail.uid;
        const senderUid = user.uid;

        // Use nullish coalescing to handle undefined or null userData.sentRequests and userByEmail.pendingRequests
        const updatedSentRequests = [...(userData.sentRequests ?? []), recipientUid];
        await updateUserData(senderUid, { sentRequests: updatedSentRequests });

        const updatedPendingRequests = [...(userByEmail.pendingRequests ?? []), senderUid];
        await updateUserData(recipientUid, { pendingRequests: updatedPendingRequests });

        console.log('Friend request sent successfully.');
        setFriendRequests((prev) => {
          if (prev.find(u => u.uid === recipientUid)) return prev.at;
          const {uid, username} = userByEmail;
          return [...prev, {uid, username, type: 'sent'}];
        })
        // Close the modal after sending the friend request
        setIsContactModalVisible(false);
      } else {
        console.log('User not found with the provided email.');
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
    }
  };

  const handleAcceptRequest = async (senderUid) => {
    try {
      const senderUserData = await getUserByUid(senderUid);
      const recipientUid = user.uid;

      // Add both user IDs to each other's friendsList
      const updatedSenderFriendsList = [...senderUserData.friendsList, recipientUid];
      await updateUserData(senderUid, { friendsList: updatedSenderFriendsList });

      const updatedRecipientFriendsList = [...userData.friendsList, senderUid];
      await updateUserData(recipientUid, { friendsList: updatedRecipientFriendsList });

      // Remove the request from the recipient's pendingRequests
      const updatedPendingRequests = userData.pendingRequests.filter(request => request !== senderUid);
      await updateUserData(recipientUid, { pendingRequests: updatedPendingRequests });

      console.log('Friend request accepted successfully.');
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };

  const handleRejectRequest = () => {
    // Clear the pending request state when rejecting
    setPendingRequest(null);
    // Close the modal
    setIsContactModalVisible(false);
  };

  return (
    <>
      {user ? (
        // User is logged in, display contact list
        <div>
          {/* Start chat content */}
          <div>

            <div className="p-6 pb-0">
              <div className="ltr:float-right rtl:float-left">
                <div className="relative">
                  {/* Button to open the modal */}
                  <button onClick={toggleModal} type="button" className="px-4 text-lg text-gray-500 group/tag">
                    <i className="mr-1 ri-user-add-line ms-0 dark:text-violet-200" />
                    <span className="absolute items-center hidden mb-6 top-8 group-hover/tag:flex ltr:-left-8 rtl:-right-8">
                      <span className="relative z-10 p-2 text-xs leading-none text-white whitespace-no-wrap bg-black rounded shadow-lg">
                        Add Contact
                      </span>
                      <span className="w-3 h-3 -mt-6 rotate-45 bg-black ltr:-ml-12 rtl:-mr-12" />
                    </span>
                  </button>
                </div>
              </div>
              <h4 className="mb-6 dark:text-gray-50">Contacts</h4>
              <div className="relative z-50 modal" id="modal-id2" aria-modal="true" role="modal-fifth">
                {isContactModalVisible && (
                  <div className="fixed inset-0 z-50">
                    <div className="absolute inset-0 transition-opacity bg-black bg-opacity-50 modal-overlay" />
                    <div className="flex items-center justify-center max-w-lg min-h-screen p-4 mx-auto text-center animate-translate">
                      <div className="relative w-full max-w-lg my-8 text-left transition-all transform bg-white rounded-lg shadow-xl -top-10 dark:bg-zinc-700">
                        <div className="bg-violet-800/10 dark:bg-zinc-700">
                          <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-zinc-500">
                            <h5 className="mb-0 text-gray-800 text-16 dark:text-gray-50" id="addgroup-exampleModaL">
                              Add Contact
                            </h5>
                            <button
                              type="button"
                              className="absolute top-3 ltr:right-2.5 rtl:left-2.5 text-gray-400 border-transparent hover:bg-gray-50/50/50 hover:text-gray-900 rounded-lg text-sm px-2 py-1 ml-auto inline-flex items-center dark:hover:bg-zinc-600 dark:text-gray-100"
                              onClick={toggleModal}
                            >
                              <i className="text-xl text-gray-500 mdi mdi-close dark:text-zinc-100/60" />
                            </button>
                          </div>

                          <div className="p-4">
                            <form>
                              <div className="mb-5 ltr:text-left rtl:text-right">
                                <label className="block mb-2 dark:text-gray-300"> Email </label>
                                <input
                                  type="text"
                                  className="py-1.5 bg-transparent border-gray-100 rounded placeholder:text-13 w-full focus:border-violet-500 focus:ring-0 focus:ring-offset-0 dark:border-zinc-500 dark:placeholder:text-gray-300"
                                  id="addgroupname-input1"
                                  placeholder="Enter Email"
                                  value={emailInputValue}
                                  onChange={(e) => setEmailInputValue(e.target.value)}
                                />
                              </div>
                              {/* Other input fields can be added here */}

                              <div className="flex justify-end p-4 border-t border-gray-100 dark:border-zinc-500">
                                <div>
                                  <button
                                    type="button"
                                    className="border-0 btn hover:underline group-data-[theme-color=violet]:text-violet-500 group-data-[theme-color=green]:text-green-500 group-data-[theme-color=red]:text-red-500"
                                    onClick={toggleModal}
                                  >
                                    Close
                                  </button>
                                  <button
                                    type="button"
                                    className="text-white border-transparent btn group-data-[theme-color=violet]:bg-violet-500 group-data-[theme-color=violet]:hover:bg-violet-600 group-data-[theme-color=green]:bg-green-500 group-data-[theme-color=green]:hover:bg-green-600 group-data-[theme-color=red]:bg-red-500 group-data-[theme-color=red]:hover:bg-red-600"
                                    onClick={handleSendInvitation}
                                  >
                                    Invite Contact
                                  </button>
                                </div>
                              </div>
                            </form>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Search bar */}
              <div className="py-1 mt-5 mb-5 group-data-[theme-color=violet]:bg-slate-100 group-data-[theme-color=green]:bg-green-50 group-data-[theme-color=red]:bg-red-50 rounded group-data-[theme-color=violet]:dark:bg-zinc-600 group-data-[theme-color=green]:dark:bg-zinc-600 group-data-[theme-color=red]:dark:bg-zinc-600">
                <span className="group-data-[theme-color=violet]:bg-slate-100 group-data-[theme-color=green]:bg-green-50 group-data-[theme-color=red]:bg-red-50 pe-1 ps-3 group-data-[theme-color=violet]:dark:bg-zinc-600 group-data-[theme-color=green]:dark:bg-zinc-600 group-data-[theme-color=red]:dark:bg-zinc-600" id="basic-addon">
                  <i className="text-lg text-gray-700 ri-search-line search-icon dark:text-gray-200" />
                </span>
                <input type="text" className="border-0 group-data-[theme-color=violet]:bg-slate-100 group-data-[theme-color=green]:bg-green-50 group-data-[theme-color=red]:bg-red-50 group-data-[theme-color=violet]:dark:bg-zinc-600 group-data-[theme-color=green]:dark:bg-zinc-600 group-data-[theme-color=red]:dark:bg-zinc-600 placeholder:text-[14px] focus:ring-offset-0 focus:outline-none focus:ring-0 placeholder:dark:text-gray-300" placeholder="Search users.." aria-describedby="basic-addon" />
              </div>

              {/* Contacts list */}
              <h5 className="px-6 mt-8 mb-4 text-16 dark:text-gray-50">Friend requests</h5>
              <ul className="list-unstyled contact-list">
              {friendRequests && friendRequests.length > 0 && friendRequests.map(({ uid, username, type }) => (
  <li key={uid} className="px-5 py-[15px] group-data-[theme-color=violet]:hover:bg-slate-100 group-data-[theme-color=green]:hover:bg-green-50/50 group-data-[theme-color=red]:hover:bg-red-50/50 transition-all ease-in-out border-b border-white/20 dark:border-zinc-700 group-data-[theme-color=violet]:dark:hover:bg-zinc-600 group-data-[theme-color=green]:dark:hover:bg-zinc-600 group-data-[theme-color=red]:dark:hover:bg-zinc-600 dark:hover:border-zinc-700">
    <div className="flex">
      <div className="relative self-center ltr:mr-3 rtl:ml-3">
        <div className="flex items-center justify-center rounded-full w-9 h-9 group-data-[theme-color=violet]:bg-violet-500/20 group-data-[theme-color=green]:bg-green-500/20 group-data-[theme-color=red]:bg-red-500/20">
          <span className="group-data-[theme-color=violet]:text-violet-500 group-data-[theme-color=green]:text-green-500 group-data-[theme-color=red]:text-red-500">
            {username[0].toUpperCase()}
          </span>
        </div>
      </div>
      <div className="flex-grow overflow-hidden">
        <h5 className="mb-1 text-base truncate dark:text-gray-50">{username}</h5>
        {type === 'sent' ? (
          <p className="mb-0 text-gray-500 truncate dark:text-gray-300 text-14">Pending</p>
        ) : type === 'received' ? (
          <button className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">
            Accept
          </button>
        ) : null}
      </div>
    </div>
  </li>
))}
              </ul>
              <h5 className="px-6 mt-8 mb-4 text-16 dark:text-gray-50">Friends</h5>

              {/* Accept or Reject */}
              {pendingRequest && (
                <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                  {/* <p>{`${pendingRequest.senderName} wants to connect with you!`}</p>
                  <div className="mt-4 flex justify-between items-center">
                    <button onClick={() => handleAcceptRequest(pendingRequest.senderUid)} className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">
                      Accept
                    </button>
                    <button onClick={handleRejectRequest} className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600">
                      Reject
                    </button>
                  </div> */}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        // User is not logged in, display a message
        <div className="flex justify-center items-center h-screen bg-blue-100 border-t border-b border-blue-500 text-blue-700 px-4 py-3" role="alert">
          <div className="text-center">
            <p className="font-bold text-2xl">Oops! You are not logged in.</p>
            <p className="text-xl">To explore your contacts, please log in or create an account.</p>
            <div className="flex mt-6 justify-center">
              <NavLink to="/login" className="mr-4 inline-block px-6 py-3 bg-blue-500 text-white rounded-full text-lg transition duration-300 transform hover:scale-105 focus:outline-none focus:shadow-outline-blue">
                Login
              </NavLink>
              <NavLink to="/register" className="inline-block px-6 py-3 border border-blue-500 text-blue-500 rounded-full text-lg transition duration-300 transform hover:scale-105 focus:outline-none focus:shadow-outline-blue">
                Create an account
              </NavLink>
            </div>
          </div>
        </div>
      )}
    </>
  );
}