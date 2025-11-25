import { Op } from "sequelize";
import Invoice from "../models/Invoice.js";
import Client from "../models/Client.js";
import Case from "../models/Case.js";

/**
 * Invoice Service
 * Handles all business logic for invoice operations
 */

class InvoiceService {
  /**
   * Create a new invoice
   * @param {Object} invoiceData - Invoice data
   * @returns {Promise<Object>} Created invoice
   */
  async createInvoice(invoiceData) {
    try {
      // Validate required fields
      if (!invoiceData.invoiceNumber) {
        throw new Error("Invoice number is required");
      }
      if (!invoiceData.amount) {
        throw new Error("Invoice amount is required");
      }
      if (!invoiceData.clientId) {
        throw new Error("Client ID is required");
      }

      // Check for duplicate invoice number
      const existing = await Invoice.findOne({
        where: { invoiceNumber: invoiceData.invoiceNumber },
      });
      if (existing) {
        throw new Error("An invoice with this invoice number already exists");
      }

      // Verify client exists
      const client = await Client.findByPk(invoiceData.clientId);
      if (!client) {
        throw new Error("Client not found");
      }

      // Verify case exists if caseId is provided
      if (invoiceData.caseId) {
        const caseData = await Case.findByPk(invoiceData.caseId);
        if (!caseData) {
          throw new Error("Case not found");
        }
      }

      // Calculate total amount if not provided
      if (!invoiceData.totalAmount) {
        const amount = parseFloat(invoiceData.amount) || 0;
        const taxAmount = parseFloat(invoiceData.taxAmount) || 0;
        invoiceData.totalAmount = amount + taxAmount;
      }

      // Set default paid amount
      if (!invoiceData.paidAmount) {
        invoiceData.paidAmount = 0;
      }

      const invoice = await Invoice.create(invoiceData);

      return {
        success: true,
        data: invoice.toJSON(),
        message: "Invoice created successfully",
      };
    } catch (error) {
      console.error("Error creating invoice:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to create invoice",
      };
    }
  }

  /**
   * Get all invoices with optional filters
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>} List of invoices
   */
  async getAllInvoices(filters = {}) {
    try {
      let where = {};

      // If filters has a 'where' property, use it directly (Sequelize-style)
      if (filters.where) {
        where = { ...filters.where };
      } else {
        // Otherwise, build where clause from individual filter properties (legacy support)
        // Apply filters
        if (filters.status) {
          where.status = filters.status;
        }

        if (filters.clientId) {
          where.clientId = filters.clientId;
        }

        if (filters.caseId) {
          where.caseId = filters.caseId;
        }

        if (filters.startDate) {
          where.invoiceDate = {
            [Op.gte]: filters.startDate,
          };
        }

        if (filters.endDate) {
          if (where.invoiceDate) {
            where.invoiceDate[Op.lte] = filters.endDate;
          } else {
            where.invoiceDate = {
              [Op.lte]: filters.endDate,
            };
          }
        }

        if (filters.search) {
          where[Op.or] = [
            { invoiceNumber: { [Op.like]: `%${filters.search}%` } },
            { description: { [Op.like]: `%${filters.search}%` } },
          ];
        }
      }

      // Use custom order if provided, otherwise default
      const order = filters.order || [["invoiceDate", "DESC"]];

      const invoices = await Invoice.findAll({
        where,
        include: [
          { model: Client, as: "client" },
          { model: Case, as: "case" },
        ],
        order,
      });

      return {
        success: true,
        data: invoices.map((invoice) => invoice.toJSON()),
        count: invoices.length,
      };
    } catch (error) {
      console.error("Error fetching invoices:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to fetch invoices",
      };
    }
  }

  /**
   * Get an invoice by ID
   * @param {number} id - Invoice ID
   * @returns {Promise<Object>} Invoice data
   */
  async getInvoiceById(id) {
    try {
      if (!id) {
        throw new Error("Invoice ID is required");
      }

      const invoice = await Invoice.findByPk(id, {
        include: [
          { model: Client, as: "client" },
          { model: Case, as: "case" },
        ],
      });

      if (!invoice) {
        throw new Error("Invoice not found");
      }

      return {
        success: true,
        data: invoice.toJSON(),
      };
    } catch (error) {
      console.error("Error fetching invoice:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to fetch invoice",
      };
    }
  }

  /**
   * Update an invoice
   * @param {number} id - Invoice ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated invoice
   */
  async updateInvoice(id, updateData) {
    try {
      if (!id) {
        throw new Error("Invoice ID is required");
      }

      const invoice = await Invoice.findByPk(id);
      if (!invoice) {
        throw new Error("Invoice not found");
      }

      // Check for duplicate invoice number if updating
      if (
        updateData.invoiceNumber &&
        updateData.invoiceNumber !== invoice.invoiceNumber
      ) {
        const existing = await Invoice.findOne({
          where: {
            invoiceNumber: updateData.invoiceNumber,
            id: { [Op.ne]: id },
          },
        });
        if (existing) {
          throw new Error("An invoice with this invoice number already exists");
        }
      }

      // Recalculate total amount if amount or tax amount changed
      if (updateData.amount || updateData.taxAmount) {
        const amount = parseFloat(updateData.amount || invoice.amount) || 0;
        const taxAmount =
          parseFloat(updateData.taxAmount || invoice.taxAmount) || 0;
        updateData.totalAmount = amount + taxAmount;
      }

      await invoice.update(updateData);

      return {
        success: true,
        data: invoice.toJSON(),
        message: "Invoice updated successfully",
      };
    } catch (error) {
      console.error("Error updating invoice:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to update invoice",
      };
    }
  }

  /**
   * Delete an invoice
   * @param {number} id - Invoice ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteInvoice(id) {
    try {
      if (!id) {
        throw new Error("Invoice ID is required");
      }

      const invoice = await Invoice.findByPk(id);
      if (!invoice) {
        throw new Error("Invoice not found");
      }

      await invoice.destroy();

      return {
        success: true,
        message: "Invoice deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting invoice:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to delete invoice",
      };
    }
  }

  /**
   * Get pending/unpaid invoices
   * @returns {Promise<Object>} Unpaid invoices
   */
  async getUnpaidInvoices() {
    try {
      const invoices = await Invoice.findAll({
        where: {
          status: {
            [Op.in]: ["sent", "partially_paid", "overdue"],
          },
        },
        include: [
          { model: Client, as: "client" },
          { model: Case, as: "case" },
        ],
        order: [["dueDate", "ASC"]],
      });

      return {
        success: true,
        data: invoices.map((invoice) => invoice.toJSON()),
        count: invoices.length,
      };
    } catch (error) {
      console.error("Error fetching unpaid invoices:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to fetch unpaid invoices",
      };
    }
  }

  /**
   * Get overdue invoices
   * @returns {Promise<Object>} Overdue invoices
   */
  async getOverdueInvoices() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const invoices = await Invoice.findAll({
        where: {
          dueDate: {
            [Op.lt]: today,
          },
          status: {
            [Op.in]: ["sent", "partially_paid", "overdue"],
          },
        },
        include: [
          { model: Client, as: "client" },
          { model: Case, as: "case" },
        ],
        order: [["dueDate", "ASC"]],
      });

      return {
        success: true,
        data: invoices.map((invoice) => invoice.toJSON()),
        count: invoices.length,
      };
    } catch (error) {
      console.error("Error fetching overdue invoices:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to fetch overdue invoices",
      };
    }
  }

  /**
   * Get invoices by client
   * @param {number} clientId - Client ID
   * @returns {Promise<Object>} Client invoices
   */
  async getInvoicesByClient(clientId) {
    try {
      if (!clientId) {
        throw new Error("Client ID is required");
      }

      const invoices = await Invoice.findAll({
        where: { clientId },
        include: [{ model: Case, as: "case" }],
        order: [["invoiceDate", "DESC"]],
      });

      return {
        success: true,
        data: invoices.map((invoice) => invoice.toJSON()),
        count: invoices.length,
      };
    } catch (error) {
      console.error("Error fetching invoices by client:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to fetch invoices by client",
      };
    }
  }

  /**
   * Get invoices by case
   * @param {number} caseId - Case ID
   * @returns {Promise<Object>} Case invoices
   */
  async getInvoicesByCase(caseId) {
    try {
      if (!caseId) {
        throw new Error("Case ID is required");
      }

      const invoices = await Invoice.findAll({
        where: { caseId },
        include: [{ model: Client, as: "client" }],
        order: [["invoiceDate", "DESC"]],
      });

      return {
        success: true,
        data: invoices.map((invoice) => invoice.toJSON()),
        count: invoices.length,
      };
    } catch (error) {
      console.error("Error fetching invoices by case:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to fetch invoices by case",
      };
    }
  }

  /**
   * Send an invoice
   * @param {number} id - Invoice ID
   * @returns {Promise<Object>} Result
   */
  async sendInvoice(id) {
    try {
      const invoice = await Invoice.findByPk(id);
      if (!invoice) {
        throw new Error("Invoice not found");
      }

      await invoice.update({ status: "sent" });

      return {
        success: true,
        data: invoice.toJSON(),
        message: "Invoice sent successfully",
      };
    } catch (error) {
      console.error("Error sending invoice:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to send invoice",
      };
    }
  }

  /**
   * Cancel an invoice
   * @param {number} id - Invoice ID
   * @returns {Promise<Object>} Result
   */
  async cancelInvoice(id) {
    try {
      return await this.updateInvoice(id, { status: "cancelled" });
    } catch (error) {
      console.error("Error cancelling invoice:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to cancel invoice",
      };
    }
  }

  /**
   * Get invoice statistics
   * @param {Object} filters - Filter options (startDate, endDate)
   * @returns {Promise<Object>} Invoice statistics
   */
  async getInvoiceStats(filters = {}) {
    try {
      const where = {};

      if (filters.startDate) {
        where.invoiceDate = {
          [Op.gte]: filters.startDate,
        };
      }

      if (filters.endDate) {
        if (where.invoiceDate) {
          where.invoiceDate[Op.lte] = filters.endDate;
        } else {
          where.invoiceDate = {
            [Op.lte]: filters.endDate,
          };
        }
      }

      const invoices = await Invoice.findAll({ where });

      const stats = {
        totalInvoices: invoices.length,
        totalAmount: invoices.reduce(
          (sum, inv) => sum + parseFloat(inv.totalAmount || 0),
          0
        ),
        totalPaid: invoices.reduce(
          (sum, inv) => sum + parseFloat(inv.paidAmount || 0),
          0
        ),
        totalPending: 0,
        paidCount: invoices.filter((inv) => inv.status === "paid").length,
        unpaidCount: invoices.filter(
          (inv) => inv.status === "sent" || inv.status === "partially_paid"
        ).length,
        overdueCount: invoices.filter((inv) => inv.status === "overdue").length,
        draftCount: invoices.filter((inv) => inv.status === "draft").length,
      };

      stats.totalPending = stats.totalAmount - stats.totalPaid;

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      console.error("Error fetching invoice stats:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to fetch invoice statistics",
      };
    }
  }
}

export default new InvoiceService();
