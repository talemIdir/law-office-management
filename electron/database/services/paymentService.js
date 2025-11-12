import { Op } from "sequelize";
import Payment from "../models/Payment.js";
import Invoice from "../models/Invoice.js";

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

      // If invoice is provided, verify it exists and belongs to the case
      if (paymentData.invoiceId) {
        const invoice = await Invoice.findByPk(paymentData.invoiceId);
        if (!invoice) {
          throw new Error("Invoice not found");
        }

        // Verify invoice belongs to the same case
        if (invoice.caseId && invoice.caseId !== paymentData.caseId) {
          throw new Error("Invoice does not belong to this case");
        }

        // Validate payment amount doesn't exceed remaining balance
        const remainingBalance = parseFloat(invoice.totalAmount) - parseFloat(invoice.paidAmount);
        const paymentAmount = parseFloat(paymentData.amount);

        if (paymentAmount > remainingBalance) {
          throw new Error(`Payment amount (${paymentAmount}) exceeds remaining invoice balance (${remainingBalance})`);
        }
      }

      if (parseFloat(paymentData.amount) <= 0) {
        throw new Error("Payment amount must be greater than 0");
      }

      const payment = await Payment.create(paymentData);

      // Update invoice status after payment (if invoice is associated)
      if (paymentData.invoiceId) {
        const InvoiceService = (await import("./invoiceService.js")).default;
        await InvoiceService.updateInvoiceStatus(paymentData.invoiceId);
      }

      return {
        success: true,
        data: payment,
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

      if (filters.invoiceId) {
        where.invoiceId = filters.invoiceId;
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
              { model: (await import("../models/Client.js")).default, as: "client" },
            ],
          },
          {
            model: Invoice,
            as: "invoice",
            required: false, // Make invoice optional
          },
        ],
        order: [["paymentDate", "DESC"]],
      });

      return {
        success: true,
        data: payments,
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
              { model: (await import("../models/Client.js")).default, as: "client" },
            ],
          },
          {
            model: Invoice,
            as: "invoice",
            required: false, // Make invoice optional
          },
        ],
      });

      if (!payment) {
        throw new Error("Payment not found");
      }

      return {
        success: true,
        data: payment,
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
          { model: Invoice, as: "invoice", required: false },
          { model: (await import("../models/Case.js")).default, as: "case" },
        ],
      });

      if (!payment) {
        throw new Error("Payment not found");
      }

      // If amount is being updated and payment has an invoice, validate it
      if (updateData.amount && payment.invoiceId) {
        const invoice = payment.invoice;
        const otherPayments = await Payment.findAll({
          where: {
            invoiceId: invoice.id,
            id: { [Op.ne]: id },
          },
        });

        const otherPaymentsTotal = otherPayments.reduce(
          (sum, p) => sum + parseFloat(p.amount || 0),
          0
        );

        const newTotal = otherPaymentsTotal + parseFloat(updateData.amount);
        const invoiceTotal = parseFloat(invoice.totalAmount);

        if (newTotal > invoiceTotal) {
          throw new Error(`Total payments (${newTotal}) would exceed invoice amount (${invoiceTotal})`);
        }
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

      // Update invoice status after payment update (if invoice is associated)
      if (payment.invoiceId) {
        const InvoiceService = (await import("./invoiceService.js")).default;
        await InvoiceService.updateInvoiceStatus(payment.invoiceId);
      }

      return {
        success: true,
        data: payment,
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

      const invoiceId = payment.invoiceId;

      await payment.destroy();

      // Update invoice status after payment deletion (if invoice is associated)
      if (invoiceId) {
        const InvoiceService = (await import("./invoiceService.js")).default;
        await InvoiceService.updateInvoiceStatus(invoiceId);
      }

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
   * Get payments by invoice
   * @param {number} invoiceId - Invoice ID
   * @returns {Promise<Object>} Invoice payments
   */
  async getPaymentsByInvoice(invoiceId) {
    try {
      if (!invoiceId) {
        throw new Error("Invoice ID is required");
      }

      const payments = await Payment.findAll({
        where: { invoiceId },
        order: [["paymentDate", "DESC"]],
      });

      const total = payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

      return {
        success: true,
        data: payments,
        count: payments.length,
        total,
      };
    } catch (error) {
      console.error("Error fetching payments by invoice:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to fetch payments by invoice",
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
        include: [
          {
            model: Invoice,
            as: "invoice",
            required: false,
          },
        ],
        order: [["paymentDate", "DESC"]],
      });

      const total = payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

      return {
        success: true,
        data: payments,
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
        totalAmount: payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0),
        byMethod: {
          cash: payments.filter((p) => p.paymentMethod === "cash")
            .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0),
          check: payments.filter((p) => p.paymentMethod === "check")
            .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0),
          bank_transfer: payments.filter((p) => p.paymentMethod === "bank_transfer")
            .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0),
          credit_card: payments.filter((p) => p.paymentMethod === "credit_card")
            .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0),
          other: payments.filter((p) => p.paymentMethod === "other")
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
              { model: (await import("../models/Client.js")).default, as: "client" },
            ],
          },
          {
            model: Invoice,
            as: "invoice",
            required: false,
          },
        ],
        order: [["paymentDate", "DESC"]],
        limit,
      });

      return {
        success: true,
        data: payments,
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
