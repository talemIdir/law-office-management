import { Op } from "sequelize";
import Payment from "../models/Payment.js";

/**
 * Payment Service
 * Handles all business logic for payment operations
 */

class PaymentService {
  /**
   * Create a new payment
   * @param {Object} paymentData - Payment data
   * @returns {Promise<Object>} Created payment
   */
  async createPayment(paymentData) {
    try {
      // Validate required fields
      if (!paymentData.amount) {
        throw new Error("Payment amount is required");
      }
      if (!paymentData.paymentMethod) {
        throw new Error("Payment method is required");
      }
      if (!paymentData.caseId) {
        throw new Error("Case ID is required");
      }

      // Verify case exists
      const Case = (await import("../models/Case.js")).default;
      const caseRecord = await Case.findByPk(paymentData.caseId);
      if (!caseRecord) {
        throw new Error("Case not found");
      }

      if (parseFloat(paymentData.amount) <= 0) {
        throw new Error("Payment amount must be greater than 0");
      }

      const payment = await Payment.create(paymentData);

      return {
        success: true,
        data: payment.toJSON(),
        message: "Payment created successfully",
      };
    } catch (error) {
      console.error("Error creating payment:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to create payment",
      };
    }
  }

  /**
   * Get all payments with optional filters
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>} List of payments
   */
  async getAllPayments(filters = {}) {
    try {
      const where = {};

      // Apply filters
      if (filters.caseId) {
        where.caseId = filters.caseId;
      }

      if (filters.paymentMethod) {
        where.paymentMethod = filters.paymentMethod;
      }

      if (filters.startDate) {
        where.paymentDate = {
          [Op.gte]: filters.startDate,
        };
      }

      if (filters.endDate) {
        if (where.paymentDate) {
          where.paymentDate[Op.lte] = filters.endDate;
        } else {
          where.paymentDate = {
            [Op.lte]: filters.endDate,
          };
        }
      }

      if (filters.search) {
        where[Op.or] = [
          { reference: { [Op.like]: `%${filters.search}%` } },
          { notes: { [Op.like]: `%${filters.search}%` } },
        ];
      }

      const payments = await Payment.findAll({
        where,
        include: [
          {
            model: (await import("../models/Case.js")).default,
            as: "case",
            include: [
              {
                model: (await import("../models/Client.js")).default,
                as: "client",
              },
            ],
          },
        ],
        order: [["paymentDate", "DESC"]],
      });

      return {
        success: true,
        data: payments.map((payment) => payment.toJSON()),
        count: payments.length,
      };
    } catch (error) {
      console.error("Error fetching payments:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to fetch payments",
      };
    }
  }

  /**
   * Get a payment by ID
   * @param {number} id - Payment ID
   * @returns {Promise<Object>} Payment data
   */
  async getPaymentById(id) {
    try {
      if (!id) {
        throw new Error("Payment ID is required");
      }

      const payment = await Payment.findByPk(id, {
        include: [
          {
            model: (await import("../models/Case.js")).default,
            as: "case",
            include: [
              {
                model: (await import("../models/Client.js")).default,
                as: "client",
              },
            ],
          },
        ],
      });

      if (!payment) {
        throw new Error("Payment not found");
      }

      return {
        success: true,
        data: payment.toJSON(),
      };
    } catch (error) {
      console.error("Error fetching payment:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to fetch payment",
      };
    }
  }

  /**
   * Update a payment
   * @param {number} id - Payment ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated payment
   */
  async updatePayment(id, updateData) {
    try {
      if (!id) {
        throw new Error("Payment ID is required");
      }

      const payment = await Payment.findByPk(id, {
        include: [
          { model: (await import("../models/Case.js")).default, as: "case" },
        ],
      });

      if (!payment) {
        throw new Error("Payment not found");
      }

      // Verify case still exists if being updated
      if (updateData.caseId) {
        const Case = (await import("../models/Case.js")).default;
        const caseRecord = await Case.findByPk(updateData.caseId);
        if (!caseRecord) {
          throw new Error("Case not found");
        }
      }

      await payment.update(updateData);

      return {
        success: true,
        data: payment.toJSON(),
        message: "Payment updated successfully",
      };
    } catch (error) {
      console.error("Error updating payment:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to update payment",
      };
    }
  }

  /**
   * Delete a payment
   * @param {number} id - Payment ID
   * @returns {Promise<Object>} Deletion result
   */
  async deletePayment(id) {
    try {
      if (!id) {
        throw new Error("Payment ID is required");
      }

      const payment = await Payment.findByPk(id);
      if (!payment) {
        throw new Error("Payment not found");
      }

      await payment.destroy();

      return {
        success: true,
        message: "Payment deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting payment:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to delete payment",
      };
    }
  }

  /**
   * Get payments by case
   * @param {number} caseId - Case ID
   * @returns {Promise<Object>} Case payments
   */
  async getPaymentsByCase(caseId) {
    try {
      if (!caseId) {
        throw new Error("Case ID is required");
      }

      const payments = await Payment.findAll({
        where: { caseId },
        order: [["paymentDate", "DESC"]],
      });

      const total = payments.reduce(
        (sum, p) => sum + parseFloat(p.amount || 0),
        0
      );

      return {
        success: true,
        data: payments.map((payment) => payment.toJSON()),
        count: payments.length,
        total,
      };
    } catch (error) {
      console.error("Error fetching payments by case:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to fetch payments by case",
      };
    }
  }

  /**
   * Get payment statistics
   * @param {Object} filters - Filter options (startDate, endDate)
   * @returns {Promise<Object>} Payment statistics
   */
  async getPaymentStats(filters = {}) {
    try {
      const where = {};

      if (filters.startDate) {
        where.paymentDate = {
          [Op.gte]: filters.startDate,
        };
      }

      if (filters.endDate) {
        if (where.paymentDate) {
          where.paymentDate[Op.lte] = filters.endDate;
        } else {
          where.paymentDate = {
            [Op.lte]: filters.endDate,
          };
        }
      }

      const payments = await Payment.findAll({ where });

      const stats = {
        totalPayments: payments.length,
        totalAmount: payments.reduce(
          (sum, p) => sum + parseFloat(p.amount || 0),
          0
        ),
        byMethod: {
          cash: payments
            .filter((p) => p.paymentMethod === "cash")
            .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0),
          check: payments
            .filter((p) => p.paymentMethod === "check")
            .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0),
          bank_transfer: payments
            .filter((p) => p.paymentMethod === "bank_transfer")
            .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0),
          credit_card: payments
            .filter((p) => p.paymentMethod === "credit_card")
            .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0),
          other: payments
            .filter((p) => p.paymentMethod === "other")
            .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0),
        },
      };

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      console.error("Error fetching payment stats:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to fetch payment statistics",
      };
    }
  }

  /**
   * Get recent payments
   * @param {number} limit - Number of payments to retrieve
   * @returns {Promise<Object>} Recent payments
   */
  async getRecentPayments(limit = 10) {
    try {
      const payments = await Payment.findAll({
        include: [
          {
            model: (await import("../models/Case.js")).default,
            as: "case",
            include: [
              {
                model: (await import("../models/Client.js")).default,
                as: "client",
              },
            ],
          },
        ],
        order: [["paymentDate", "DESC"]],
        limit,
      });

      return {
        success: true,
        data: payments.map((payment) => payment.toJSON()),
        count: payments.length,
      };
    } catch (error) {
      console.error("Error fetching recent payments:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to fetch recent payments",
      };
    }
  }
}

export default new PaymentService();
