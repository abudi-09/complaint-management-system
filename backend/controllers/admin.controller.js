import User from "../models/user.model.js";

// Get all pending staff registrations
export const getPendingStaff = async (req, res) => {
  try {
    const pendingStaff = await User.find({ role: "staff", isApproved: false });
    res.status(200).json(pendingStaff);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch pending staff" });
  }
};

// Approve staff member
export const approveStaff = async (req, res) => {
  try {
    const staffId = req.params.id;
    const staff = await User.findById(staffId);

    if (!staff || staff.role !== "staff") {
      return res.status(404).json({ error: "Staff not found" });
    }

    staff.isApproved = true;
    await staff.save();

    res.status(200).json({ message: "Staff approved successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to approve staff" });
  }
};

// Reject (Delete) staff member
export const rejectStaff = async (req, res) => {
  try {
    const staffId = req.params.id;
    const staff = await User.findOneAndDelete({ _id: staffId, role: "staff" });

    if (!staff) {
      return res.status(404).json({ error: "Staff not found" });
    }

    res.status(200).json({ message: "Staff rejected and removed" });
  } catch (error) {
    console.error("Reject staff error:", error.message);
    res.status(500).json({ error: "Failed to reject staff" });
  }
};
