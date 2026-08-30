import { supabase, isSupabaseConfigured } from "./supabaseClient";

export const authService = {
  // Sign up user
  async signUp(email, password, phone = "") {
    if (!isSupabaseConfigured) {
      // Offline fallback
      const mockUser = {
        id: `usr-${Date.now()}`,
        email,
        phone,
        user_metadata: { phone }
      };
      const users = JSON.parse(localStorage.getItem("janaseva_mock_users") || "[]");
      if (users.some(u => u.email === email)) {
        throw new Error("User already exists with this email address.");
      }
      users.push(mockUser);
      localStorage.setItem("janaseva_mock_users", JSON.stringify(users));
      return { data: { user: mockUser }, error: null };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { phone }
        }
      });
      return { data, error };
    } catch (e) {
      return { data: null, error: e };
    }
  },

  // Login with Email/Password
  async signIn(email, password) {
    if (!isSupabaseConfigured) {
      const users = JSON.parse(localStorage.getItem("janaseva_mock_users") || "[]");
      const user = users.find(u => u.email === email);
      if (!user) {
        throw new Error("No user found with this email. Please sign up.");
      }
      return { data: { user }, error: null };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      return { data, error };
    } catch (e) {
      return { data: null, error: e };
    }
  },

  // Mock or real OTP signup/login
  async sendOtp(phone) {
    if (!isSupabaseConfigured) {
      // Simulate OTP code sent
      console.log(`[AuthService] Simulated OTP: 123456 sent to ${phone}`);
      return { data: { message: "OTP sent" }, error: null };
    }

    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        phone: phone.startsWith("+") ? phone : `+91${phone}`
      });
      return { data, error };
    } catch (e) {
      return { data: null, error: e };
    }
  },

  async verifyOtp(phone, token) {
    if (!isSupabaseConfigured) {
      if (token === "123456" || token === "1234") {
        const mockUser = {
          id: `usr-otp-${Date.now()}`,
          phone,
          user_metadata: { phone }
        };
        return { data: { user: mockUser }, error: null };
      } else {
        throw new Error("Invalid OTP token. Try entering '123456'.");
      }
    }

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: phone.startsWith("+") ? phone : `+91${phone}`,
        token,
        type: "sms"
      });
      return { data, error };
    } catch (e) {
      return { data: null, error: e };
    }
  },

  // Sign out
  async signOut() {
    if (!isSupabaseConfigured) {
      return { error: null };
    }
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (e) {
      return { error: e };
    }
  }
};
