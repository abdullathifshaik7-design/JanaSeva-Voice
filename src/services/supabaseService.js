import { supabase, isSupabaseConfigured } from "./supabaseClient";
import { SCHEMES as INITIAL_SCHEMES, GOVERNMENT_SERVICES as INITIAL_SERVICES } from "../data/db";

// Safe wrapper for Supabase database operations
export const supabaseService = {
  // Check if Supabase is active and reachable
  async ping() {
    if (!isSupabaseConfigured) return false;
    try {
      const { data, error } = await supabase.from("schemes").select("count", { count: "exact", head: true });
      return !error;
    } catch (e) {
      return false;
    }
  },

  // Auto seed database if connected but empty
  async checkAndSeed() {
    if (!isSupabaseConfigured) return;
    try {
      const { count, error } = await supabase.from("schemes").select("*", { count: "exact", head: true });
      if (error) return;

      if (count === 0) {
        console.log("Supabase connected but empty. Seeding initial schemes and services...");
        
        // Seed schemes
        for (const s of INITIAL_SCHEMES) {
          await supabase.from("schemes").insert([{
            id: s.id,
            name: s.name,
            alternate_names: s.alternateNames,
            department: s.department,
            government_level: s.governmentLevel,
            state: s.state,
            category: s.category,
            target_groups: s.targetGroups,
            description: s.description,
            benefits: s.benefits,
            eligibility: s.eligibility,
            age_criteria: s.ageCriteria,
            income_criteria: s.incomeCriteria,
            required_documents: s.requiredDocuments,
            application_steps: s.applicationSteps,
            application_mode: s.applicationMode,
            official_website: s.officialWebsite,
            official_source: s.officialSource,
            helpline: s.helpline,
            status: s.status,
            simple_explanation: s.simpleExplanation
          }]);
        }

        // Seed services
        for (const s of INITIAL_SERVICES) {
          await supabase.from("services").insert([{
            id: s.id,
            name: s.name,
            alternate_names: s.alternateNames,
            department: s.department,
            government_level: s.governmentLevel,
            state: s.state,
            category: s.category,
            description: s.description,
            eligibility: s.eligibility,
            required_documents: s.requiredDocuments,
            application_steps: s.applicationSteps,
            official_website: s.officialWebsite,
            helpline: s.helpline,
            status: s.status || "Active"
          }]);
        }
        console.log("Seeding complete!");
      }
    } catch (e) {
      console.warn("Autoseeding failed:", e);
    }
  },

  // Fetch schemes
  async fetchSchemes() {
    if (!isSupabaseConfigured) return null;
    try {
      const { data, error } = await supabase.from("schemes").select("*");
      if (error) throw error;
      
      // Remap columns to match frontend camelCase keys
      return data.map(s => ({
        id: s.id,
        name: s.name,
        alternateNames: s.alternate_names || [],
        department: s.department,
        governmentLevel: s.government_level,
        state: s.state,
        category: s.category,
        targetGroups: s.target_groups || [],
        description: s.description,
        benefits: s.benefits,
        eligibility: s.eligibility,
        ageCriteria: s.age_criteria,
        incomeCriteria: s.income_criteria,
        requiredDocuments: s.required_documents || [],
        applicationSteps: s.application_steps || [],
        applicationMode: s.application_mode,
        officialWebsite: s.official_website,
        officialSource: s.official_source,
        helpline: s.helpline,
        status: s.status || "Active",
        simpleExplanation: s.simple_explanation || {}
      }));
    } catch (e) {
      console.error("Supabase fetchSchemes failed, using local fallback:", e);
      return null;
    }
  },

  // Fetch services
  async fetchServices() {
    if (!isSupabaseConfigured) return null;
    try {
      const { data, error } = await supabase.from("services").select("*");
      if (error) throw error;

      return data.map(s => ({
        id: s.id,
        name: s.name,
        alternateNames: s.alternate_names || [],
        department: s.department,
        governmentLevel: s.government_level,
        state: s.state,
        category: s.category,
        description: s.description,
        eligibility: s.eligibility,
        requiredDocuments: s.required_documents || [],
        applicationSteps: s.application_steps || [],
        officialWebsite: s.official_website,
        helpline: s.helpline,
        status: s.status || "Active"
      }));
    } catch (e) {
      console.error("Supabase fetchServices failed, using local fallback:", e);
      return null;
    }
  },

  // Save scheme (Upsert)
  async saveScheme(s) {
    if (!isSupabaseConfigured) return false;
    try {
      const { error } = await supabase.from("schemes").upsert([{
        id: s.id,
        name: s.name,
        alternate_names: s.alternateNames,
        department: s.department,
        government_level: s.governmentLevel,
        state: s.state,
        category: s.category,
        target_groups: s.targetGroups || [],
        description: s.description,
        benefits: s.benefits,
        eligibility: s.eligibility,
        age_criteria: s.ageCriteria,
        income_criteria: s.incomeCriteria,
        required_documents: s.requiredDocuments,
        application_steps: s.applicationSteps,
        application_mode: s.applicationMode || "Online",
        official_website: s.officialWebsite,
        official_source: s.officialSource,
        helpline: s.helpline,
        status: s.status,
        simple_explanation: s.simpleExplanation
      }]);
      return !error;
    } catch (e) {
      return false;
    }
  },

  // Delete scheme
  async deleteScheme(id) {
    if (!isSupabaseConfigured) return false;
    try {
      const { error } = await supabase.from("schemes").delete().eq("id", id);
      return !error;
    } catch (e) {
      return false;
    }
  },

  // Save service (Upsert)
  async saveService(s) {
    if (!isSupabaseConfigured) return false;
    try {
      const { error } = await supabase.from("services").upsert([{
        id: s.id,
        name: s.name,
        alternate_names: s.alternateNames,
        department: s.department,
        government_level: s.governmentLevel,
        state: s.state,
        category: s.category,
        description: s.description,
        eligibility: s.eligibility,
        required_documents: s.requiredDocuments,
        application_steps: s.applicationSteps,
        official_website: s.officialWebsite,
        helpline: s.helpline,
        status: s.status
      }]);
      return !error;
    } catch (e) {
      return false;
    }
  },

  // Delete service
  async deleteService(id) {
    if (!isSupabaseConfigured) return false;
    try {
      const { error } = await supabase.from("services").delete().eq("id", id);
      return !error;
    } catch (e) {
      return false;
    }
  },

  // Fetch complaints
  async fetchComplaints() {
    if (!isSupabaseConfigured) return null;
    try {
      const { data, error } = await supabase.from("complaints").select("*");
      if (error) throw error;
      return data.map(c => ({
        id: c.id,
        name: c.name,
        mobile: c.mobile,
        state: c.state,
        category: c.category,
        description: c.description,
        preferredLanguage: c.preferred_language,
        status: c.status,
        date: c.date,
        timeline: c.timeline || []
      }));
    } catch (e) {
      return null;
    }
  },

  // Save complaint
  async saveComplaint(c) {
    if (!isSupabaseConfigured) return false;
    try {
      const { error } = await supabase.from("complaints").upsert([{
        id: c.id,
        name: c.name,
        mobile: c.mobile,
        state: c.state,
        category: c.category,
        description: c.description,
        preferred_language: c.preferredLanguage,
        status: c.status,
        date: c.date,
        timeline: c.timeline
      }]);
      return !error;
    } catch (e) {
      return false;
    }
  },

  // Fetch feedbacks
  async fetchFeedbacks() {
    if (!isSupabaseConfigured) return null;
    try {
      const { data, error } = await supabase.from("feedbacks").select("*");
      if (error) throw error;
      return data;
    } catch (e) {
      return null;
    }
  },

  // Save feedback
  async saveFeedback(f) {
    if (!isSupabaseConfigured) return false;
    try {
      const { error } = await supabase.from("feedbacks").insert([{
        id: f.id,
        type: f.type,
        scheme_name: f.schemeName || null,
        helpfulness: f.helpfulness || null,
        rating: f.rating || null,
        comment: f.comment || null,
        date: f.date
      }]);
      return !error;
    } catch (e) {
      return false;
    }
  },

  // Fetch applications
  async fetchApplications() {
    if (!isSupabaseConfigured) return null;
    try {
      const { data, error } = await supabase.from("applications").select("*");
      if (error) throw error;
      return data.map(a => ({
        id: a.id,
        schemeId: a.scheme_id,
        schemeName: a.scheme_name,
        citizenName: a.citizen_name,
        status: a.status,
        date: a.date,
        timeline: a.timeline || []
      }));
    } catch (e) {
      return null;
    }
  },

  // Save application
  async saveApplication(a) {
    if (!isSupabaseConfigured) return false;
    try {
      const { error } = await supabase.from("applications").upsert([{
        id: a.id,
        scheme_id: a.schemeId,
        scheme_name: a.schemeName,
        citizen_name: a.citizenName,
        status: a.status,
        date: a.date,
        timeline: a.timeline
      }]);
      return !error;
    } catch (e) {
      return false;
    }
  },

  // Save profile
  async saveProfile(userId, profile) {
    if (!profile) return false;
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.updateUser({
          data: {
            fullName: profile.fullName || "",
            mobileNumber: profile.mobileNumber || "",
            email: profile.email || "",
            state: profile.state || "",
            district: profile.district || "",
            age: profile.age ? String(profile.age) : "",
            profession: profile.profession || "",
            income: profile.income || "",
            incomeCategory: profile.incomeCategory || profile.income || "",
            preferredLanguage: profile.preferredLanguage || "en",
            address: profile.address || ""
          }
        });
      }
    } catch (e) {
      console.warn("Could not save to auth metadata:", e);
    }

    if (!isSupabaseConfigured) return false;
    try {
      const { error } = await supabase.from("users").upsert([{
        id: userId,
        state: profile.state || "",
        district: profile.district || "",
        age_group: profile.age ? String(profile.age) : (profile.ageGroup || ""),
        profession: profile.profession || "",
        income_category: profile.incomeCategory || profile.income || ""
      }]);
      return !error;
    } catch (e) {
      return false;
    }
  },

  // Fetch profile
  async fetchProfile(userId) {
    if (!isSupabaseConfigured) return null;
    let authProfile = null;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.user_metadata) {
        authProfile = {
          fullName: user.user_metadata.fullName || "",
          mobileNumber: user.user_metadata.mobileNumber || "",
          email: user.user_metadata.email || user.email || "",
          state: user.user_metadata.state || "",
          district: user.user_metadata.district || "",
          age: user.user_metadata.age || "",
          profession: user.user_metadata.profession || "",
          income: user.user_metadata.income || user.user_metadata.incomeCategory || "",
          incomeCategory: user.user_metadata.incomeCategory || user.user_metadata.income || "",
          preferredLanguage: user.user_metadata.preferredLanguage || "en",
          address: user.user_metadata.address || ""
        };
      }
    } catch (e) {}

    try {
      const { data, error } = await supabase.from("users").select("*").eq("id", userId).single();
      if (error) throw error;
      const merged = {
        ...authProfile,
        fullName: authProfile?.fullName || data.full_name || data.name || "",
        mobileNumber: authProfile?.mobileNumber || data.mobile || data.phone || "",
        email: authProfile?.email || "",
        state: data.state || authProfile?.state || "",
        district: data.district || authProfile?.district || "",
        age: authProfile?.age || data.age || data.age_group || "",
        ageGroup: data.age_group || authProfile?.age || "",
        profession: data.profession || authProfile?.profession || "",
        incomeCategory: data.income_category || authProfile?.incomeCategory || "",
        income: authProfile?.income || data.income_category || data.income || ""
      };
      return (merged.fullName || merged.mobileNumber || merged.state) ? merged : null;
    } catch (e) {
      if (authProfile && (authProfile.fullName || authProfile.mobileNumber || authProfile.state)) {
        return authProfile;
      }
      return null;
    }
  }
};
