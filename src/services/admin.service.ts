// Admin Service Layer Boundary (Integration Shell)
export const adminService = {
  async getPendingPayments() {
    return [];
  },
  async approvePayment() {
    return { success: true };
  },
  async rejectPayment() {
    return { success: true };
  },
  async getUsers() {
    return [];
  },
};
