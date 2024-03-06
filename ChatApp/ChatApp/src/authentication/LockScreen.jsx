import React, { useContext, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Meta } from "../components/Meta/Meta";
import { Login } from "./Login";
import { AppContext } from '../appContext/AppContext.js';

export function LockScreen() {
  const { userData } = useContext(AppContext);
  const [enteredPassword, setEnteredPassword] = useState("");
  const [photoURL] = useState(userData?.profilePhotoURL);

  const unlockProfile = () => {
    if (userData.password === enteredPassword) {
      console.log('Unlocking profile...');
      // Perform actions to unlock the profile
    } else {
      console.log('Incorrect password');
      // Handle incorrect password case
    }
  }

  return (
    <>
      <Meta title={'LockScreen'} />

      <div className="w-full h-full">
        <div className="px-5 py-24 sm:px-24 lg:px-0">
          <div className="grid items-center justify-center grid-cols-1 lg:grid-cols-12 auth-bg">
            <div className="mx-5 lg:mx-20 lg:col-start-5 lg:col-span-4">
              <div className="text-center">
                <NavLink to="/lock-screen" className="block mb-10">
                  <img src="/assets/images/logo-dark.png" alt="" className="block h-8 mx-auto dark:hidden" />
                  <img src="assets/images/logo-light.png" alt="" className="hidden h-8 mx-auto logo-light dark:block" />
                </NavLink>
                <h4 className="mb-2 text-gray-800 text-21 dark:text-gray-50"> Lock screen </h4>
                <p className="mb-6 text-gray-500 dark:text-gray-300"> Enter your password to unlock the screen! </p>
              </div>
              <div className="bg-white card dark:bg-zinc-800 dark:border-transparent">
                <div className="p-5">
                  <div className="p-4">
                    <div className="mb-4 text-center user-thumb">
                      <img src={photoURL} className="w-24 h-24 mx-auto border-4 rounded-full border-gray-50 dark:border-zinc-600" alt="thumbnail" />
                      <h5 className="mt-3 text-base text-gray-700 dark:text-gray-200"> {userData.username} </h5>
                    </div>
                    <form action="Index.jsx">
                      <div className="mb-5">
                        <label className="font-medium text-gray-700 dark:text-gray-200"> {userData.password} </label>
                        <div className="flex items-center mt-2 mb-3 rounded-3 bg-slate-50/50 dark:bg-transparent">
                          <span className="flex items-center px-4 py-2 text-gray-500 border border-r-0 border-gray-100 rounded rounded-r-none dark:border-zinc-600" id="basic-addon3">
                            <i className="ri-lock-2-line text-16" />
                          </span>
                          <input
                            type="password"
                            value={enteredPassword}
                            onChange={(e) => setEnteredPassword(e.target.value)}
                            className="w-full border-gray-100 rounded rounded-l-none placeholder:text-14 bg-slate-50/50 text-14 focus:ring-0 dark:bg-zinc-700 dark:border-zinc-600 dark:text-gray-200"
                            placeholder="Enter Password"
                            aria-label="Enter Password"
                            aria-describedby="basic-addon3"
                          />
                        </div>
                      </div>
                      <div className="grid">
                        <button className="py-2 text-white border-transparent btn bg-violet-500 hover:bg-violet-600 text-16" type="button" onClick={unlockProfile}>
                          Unlock
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
              <div className="mt-10 text-center">
                <p className="mb-5 text-gray-700 dark:text-gray-200"> Not you? Return{" "}
                  <Login className="fw-medium text-violet-500"></Login>
                </p>
                <p className="text-gray-700 dark:text-gray-200">
                  © Chatvia. Crafted with{" "}
                  <i className="text-red-500 mdi mdi-heart" /> by Themesbrand
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
