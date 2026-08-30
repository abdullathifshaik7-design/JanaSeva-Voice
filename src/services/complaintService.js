const DEMO_COMPLAINT = {
  transcript: "మా గ్రామంలో street lights పని చేయడం లేదు.",
  category: "Public Infrastructure",
  issue: "Street Lights",
  location: "Not confirmed",
};

export async function recordDemoComplaint() {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ ...DEMO_COMPLAINT }), 1800);
  });
}

export async function registerComplaint(_data) {
  return Promise.resolve({
    id: "JSV-2026-00124",
    status: "Registered",
    timeline: [
      { title: "Complaint Submitted", done: true, current: false },
      { title: "Request Acknowledged", done: true, current: false },
      { title: "Assigned", done: false, current: true },
      { title: "In Progress", done: false, current: false },
      { title: "Resolved", done: false, current: false },
    ],
  });
}
