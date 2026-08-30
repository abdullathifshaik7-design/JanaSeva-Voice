const DEMO_APPLICATION = {
  id: "APP-2026-08321",
  type: "Pension",
  status: "Verification in Progress",
  statusColor: "#d97706",
  timeline: [
    { title: "Application Submitted", done: true, current: false, date: "26 Aug 2026" },
    { title: "Documents Received", done: true, current: false, date: "26 Aug 2026" },
    { title: "Verification", done: false, current: true, date: "In progress" },
    { title: "Approved", done: false, current: false, date: "Pending" },
    { title: "Completed", done: false, current: false, date: "Pending" },
  ],
  voiceSummary:
    "Your pension application is currently in verification stage. Documents have been received.",
};

export async function checkApplicationStatus(appId) {
  if (appId.trim().toUpperCase() === DEMO_APPLICATION.id) {
    return { found: true, ...DEMO_APPLICATION };
  }
  return { found: false, message: "No demo application found for this ID. Try APP-2026-08321." };
}
