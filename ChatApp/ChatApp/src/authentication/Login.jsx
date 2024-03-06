import React, { useContext, useEffect, useState } from "react";
import { NavLink, Link, useLocation, useNavigate} from 'react-router-dom';
import { Meta } from "../components/Meta/Meta";
import { AppContext } from "../appContext/AppContext";
import { loginUser } from "../service/auth.service";

export function Login() {
  const { user, setContext } = useContext(AppContext);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const [errorMessage, setErrorMessage] = useState('');

  const updateForm = (prop) => (e) => {
    setForm({ ...form, [prop]: e.target.value });
    setErrorMsg("");
  };

  useEffect(() => {
    console.log("User state:", user);
    if (user) {
      navigate(location.state?.from.pathname || "/chats");
    }
  }, [user, navigate, location.state]);

  const login = async (event) => {
    event.preventDefault();

    try {
      console.log("Logging in...");
      const credentials = await loginUser(form.email, form.password);
      setContext({ user: credentials.user, userData: null });
      navigate("/chats");
    } catch (error) {
      if (error.code === "auth/invalid-credential") {
        setErrorMsg("The username or/and password you entered is/are incorrect. Please try again.");
      } else if (error.code === "auth/too-many-requests") {
        setErrorMsg("Access to this account has been temporarily disabled due to many failed login attempts. You can immediately restore it by resetting your password or you can try again later.");
      } else {
        setErrorMsg("An error occurred. Please try again.");
      }
      console.log(error);
    }
  };

  return (
    <>
      <Meta title={'Login'} />

      <div className="w-full h-full">
        <div className="px-5 py-24 sm:px-24 lg:px-0">
          <div className="grid items-center justify-center grid-cols-1 lg:grid-cols-12 auth-bg">
            <div className="mx-5 lg:mx-20 lg:col-start-5 lg:col-span-4">
              <div className="text-center">
                <NavLink to="/" className="block mb-10" >
                <img src="assets/images/logo-dark.png" alt="" className="block h-8 mx-auto dark:hidden" />
                <img src="assets/images/logo-light.png" alt="" className="hidden h-8 mx-auto logo-light dark:block" />
                </NavLink>
                <h4 className="mb-2 text-gray-800 text-21 dark:text-gray-50"> Login </h4>
                <p className="mb-6 text-gray-500 dark:text-gray-300">
                  Login to continue to ChatApp.
                </p>
              </div>
              <div className="bg-white card dark:bg-zinc-800 dark:border-transparent">
                <div className="p-5">
                  <div className="p-4">
                    <form action="Index.jsx">

                      {/* Username*/}
                      <div className="mb-5">
                        <label className="font-medium text-gray-700 dark:text-gray-200">
                          Email
                        </label>
                        <div className="flex items-center mt-2 mb-3 rounded-3 bg-slate-50/50 dark:bg-transparent">
                          <span className="flex items-center px-4 py-2 text-gray-500 border border-r-0 border-gray-100 rounded rounded-r-none dark:border-zinc-600" id="basic-addon3">
                            <i className="ri-user-2-line text-16" />
                          </span>
                          <input value={form.email} onChange={updateForm("email")} type="text" className="w-full border-gray-100 rounded rounded-l-none placeholder:text-14 bg-slate-50/50 text-14 focus:ring-0 dark:bg-zinc-700 dark:border-zinc-600 dark:text-gray-200" placeholder="Enter Email" aria-label="Enter Email" aria-describedby="basic-addon3" />
                        </div>
                      </div>

                      {/* Password */}
                      <div className="mb-6">
                        <div className="float-right">
                          <NavLink to='/recover' className="text-gray-500 text-13 ">Forgot password?</NavLink>
                        </div>
                        <label className="font-medium text-gray-700 dark:text-gray-200"> Password </label>
                        <div className="flex items-center mt-2 mb-3 rounded-3 bg-slate-50/50 dark:bg-transparent">
                          <span className="flex items-center px-4 py-2 text-gray-500 border border-r-0 border-gray-100 rounded rounded-r-none dark:border-zinc-600" id="basic-addon4" >
                            <i className="ri-lock-2-line text-16" />
                          </span>
                          <input value={form.password} onChange={updateForm("password")} type="password" className="w-full border-gray-100 rounded rounded-l-none placeholder:text-14 bg-slate-50/50 text-14 focus:ring-0 dark:bg-zinc-700 dark:border-zinc-600 dark:text-gray-200" placeholder="Enter Password" aria-label="Enter Password" aria-describedby="basic-addon4" />
                        </div>
                      </div>
                      <div className="flex items-center mb-6">
                        <input type="checkbox" className="border-gray-100 rounded focus:ring-1 checked:ring-1 focus:ring-offset-0 focus:outline-0 checked:bg-violet-500 dark:bg-zinc-600 dark:border-zinc-600 dark:checked:bg-violet-500 " id="memberCheck1" />
                        <label className="font-medium text-gray-700 ltr:ml-2 rtl:mr-2 dark:text-gray-200" htmlFor="remember-check">
                          Remember me
                        </label>
                      </div>
                      <div className="grid">
                        <button onClick={login} className="py-2 text-white border-transparent btn bg-violet-500 hover:bg-violet-600 text-16" type="submit" >
                          Login
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
              <div className="mt-10 text-center">
                <p className="mb-5 text-gray-700 dark:text-gray-200"> Don't have an account ?{" "}
                  {/* <a href="./Register.jsx" className="fw-medium text-violet-500">
                    Signup now{" "}
                  </a>{" "} */}
                  <NavLink to='/register' className="fw-medium text-violet-500 "> Register {" "}</NavLink>
                </p>
                <p className="text-gray-700 dark:text-gray-200"> © ChatApp. Crafted {" "}
                  <i className="text-red-500 mdi mdi-heart" /> by Andy, Zvezdy, Marty
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
