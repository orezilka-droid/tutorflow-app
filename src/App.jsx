import { useState, useEffect } from "react";
import { SplashScreen } from "./screens/SplashScreen";
import { LoginScreen } from "./screens/LoginScreen";
import { TutorFlowApp } from "./TutorFlowApp";
import { InstallPrompt } from "./components/InstallPrompt";
import { supabase } from "./lib/supabaseClient";

export default function App() {
  const [screen, setScreen] = useState("splash"); // "splash" | "login" | "app"
  const [loginMode, setLoginMode] = useState("login");
  const [session, setSession] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthChecked(true);
      if (session) setScreen("app");
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        setScreen("app");
      } else {
        setScreen((prev) => (prev === "app" ? "splash" : prev));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setScreen("splash");
  };

  // Wait for the initial session check before deciding what to render, so a
  // returning logged-in user doesn't flash the splash/login screens.
  if (!authChecked) return null;

  if (session) return (
    <>
      <TutorFlowApp user={session.user} onLogout={handleLogout} />
      <InstallPrompt />
    </>
  );

  if (screen === "login") return (
    <>
      <LoginScreen
        initialMode={loginMode}
        onBack={() => setScreen("splash")}
      />
      <InstallPrompt />
    </>
  );

  return (
    <>
      <SplashScreen
        onLogin={() => { setLoginMode("login"); setScreen("login"); }}
        onRegister={() => { setLoginMode("register"); setScreen("login"); }}
      />
      <InstallPrompt />
    </>
  );
}
