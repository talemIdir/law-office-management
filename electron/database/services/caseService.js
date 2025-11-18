import { Op } from "sequelize";
import Case from "../models/Case.js";
import Client from "../models/Client.js";
import CourtSession from "../models/CourtSession.js";
import Document from "../models/Document.js";
import Invoice from "../models/Invoice.js";
import Expense from "../models/Expense.js";
import Appointment from "../models/Appointment.js";
import User from "../models/User.js";

/**
 * Case Service
 * Handles all business logic for case operations
 */

class CaseService {
  /**
   * Create a new case
   * @param {Object} caseData - Case data
   * @returns {Promise<Object>} Created case
   */
  async createCase(caseData) {
    try {
      // Validate required fields
      if (!caseData.caseNumber) {
        throw new Error("Case number is required");
      }
      if (!caseData.title) {
        throw new Error("Case title is required");
      }
      if (!caseData.caseType) {
        throw new Error("Case type is required");
      }
      if (!caseData.clientRole) {
        throw new Error("Client role is required");
      }

      // Check for duplicate case number
      const existing = await Case.findOne({
        where: { caseNumber: caseData.caseNumber },
      });
      if (existing) {
        throw new Error("A case with this case number already exists");
      }

      // Verify client exists if clientId is provided
      if (caseData.clientId) {
        const Client = (await import("../models/Client.js")).default;
        const client = await Client.findByPk(caseData.clientId);
        if (!client) {
          throw new Error("Client not found");
        }
      }

      const newCase = await Case.create(caseData);

      return {
        success: true,
        data: newCase.toJSON(),
        message: "Case created successfully",
      };
    } catch (error) {
      console.error("Error creating case:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to create case",
      };
    }
  }

  /**
   * Get all cases with optional filters
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>} List of cases
   */
  async getAllCases(filters = {}) {
    try {
      const where = {};

      // Apply filters
      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.caseType) {
        where.caseType = filters.caseType;
      }

      if (filters.priority) {
        where.priority = filters.priority;
      }

      if (filters.clientId) {
        where.clientId = filters.clientId;
      }

      if (filters.assignedLawyerId) {
        where.assignedLawyerId = filters.assignedLawyerId;
      }

      if (filters.clientRole) {
        where.clientRole = filters.clientRole;
      }

      if (filters.search) {
        where[Op.or] = [
          { caseNumber: { [Op.like]: `%${filters.search}%` } },
          { title: { [Op.like]: `%${filters.search}%` } },
          { description: { [Op.like]: `%${filters.search}%` } },
          { court: { [Op.like]: `%${filters.search}%` } },
          { judge: { [Op.like]: `%${filters.search}%` } },
          { opposingParty: { [Op.like]: `%${filters.search}%` } },
        ];
      }

      if (filters.startDate) {
        where.startDate = { [Op.gte]: filters.startDate };
      }

      if (filters.endDate) {
        where.endDate = { [Op.lte]: filters.endDate };
      }

      const cases = await Case.findAll({
        where,
        order: [["createdAt", "DESC"]],
        include: [
          { model: Client, as: "client" },
          { model: User, as: "assignedLawyer" },
        ],
      });

      return {
        success: true,
        data: cases.map((cas) => cas.toJSON()),
        count: cases.length,
      };
    } catch (error) {
      console.error("Error fetching cases:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to fetch cases",
      };
    }
  }

  /**
   * Get a case by ID
   * @param {number} id - Case ID
   * @param {boolean} includeRelations - Include related data
   * @returns {Promise<Object>} Case data
   */
  async getCaseById(id, includeRelations = false) {
    try {
      if (!id) {
        throw new Error("Case ID is required");
      }

      const include = includeRelations
        ? [
            { model: Client, as: "client" },
            { model: User, as: "assignedLawyer" },
            { model: CourtSession, as: "courtSessions" },
            { model: Document, as: "documents" },
            { model: Invoice, as: "invoices" },
            { model: Expense, as: "expenses" },
            { model: Appointment, as: "appointments" },
          ]
        : [
            { model: Client, as: "client" },
            { model: User, as: "assignedLawyer" },
          ];

      const caseData = await Case.findByPk(id, { include });

      if (!caseData) {
        throw new Error("Case not found");
      }

      return {
        success: true,
        data: caseData.toJSON(),
      };
    } catch (error) {
      console.error("Error fetching case:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to fetch case",
      };
    }
  }

  /**
   * Update a case
   * @param {number} id - Case ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated case
   */
  async updateCase(id, updateData) {
    try {
      if (!id) {
        throw new Error("Case ID is required");
      }

      const caseData = await Case.findByPk(id);
      if (!caseData) {
        throw new Error("Case not found");
      }

      // Check for duplicate case number if updating
      if (
        updateData.caseNumber &&
        updateData.caseNumber !== caseData.caseNumber
      ) {
        const existing = await Case.findOne({
          where: {
            caseNumber: updateData.caseNumber,
            id: { [Op.ne]: id },
          },
        });
        if (existing) {
          throw new Error("A case with this case number already exists");
        }
      }

      await caseData.update(updateData);

      return {
        success: true,
        data: caseData.toJSON(),
        message: "Case updated successfully",
      };
    } catch (error) {
      console.error("Error updating case:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to update case",
      };
    }
  }

  /**
   * Delete a case
   * @param {number} id - Case ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteCase(id) {
    try {
      if (!id) {
        throw new Error("Case ID is required");
      }

      const caseData = await Case.findByPk(id);
      if (!caseData) {
        throw new Error("Case not found");
      }

      await caseData.destroy();

      return {
        success: true,
        message: "Case deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting case:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to delete case",
      };
    }
  }

  /**
   * Get case statistics
   * @param {number} id - Case ID
   * @returns {Promise<Object>} Case statistics
   */
  async getCaseStats(id) {
    try {
      if (!id) {
        throw new Error("Case ID is required");
      }

      const caseData = await Case.findByPk(id, {
        include: [
          { model: CourtSession, as: "courtSessions" },
          { model: Document, as: "documents" },
          { model: Invoice, as: "invoices" },
          { model: Expense, as: "expenses" },
          { model: Appointment, as: "appointments" },
        ],
      });

      if (!caseData) {
        throw new Error("Case not found");
      }

      const stats = {
        totalCourtSessions: caseData.courtSessions?.length || 0,
        completedSessions:
          caseData.courtSessions?.filter((s) => s.status === "completed")
            .length || 0,
        upcomingSessions:
          caseData.courtSessions?.filter(
            (s) =>
              new Date(s.sessionDate) > new Date() && s.status === "scheduled"
          ).length || 0,
        totalDocuments: caseData.documents?.length || 0,
        totalInvoices: caseData.invoices?.length || 0,
        totalBilled:
          caseData.invoices?.reduce(
            (sum, inv) => sum + parseFloat(inv.totalAmount || 0),
            0
          ) || 0,
        totalPaid:
          caseData.invoices?.reduce(
            (sum, inv) => sum + parseFloat(inv.paidAmount || 0),
            0
          ) || 0,
        totalExpenses:
          caseData.expenses?.reduce(
            (sum, exp) => sum + parseFloat(exp.amount || 0),
            0
          ) || 0,
        totalAppointments: caseData.appointments?.length || 0,
        upcomingAppointments:
          caseData.appointments?.filter(
            (a) =>
              new Date(a.appointmentDate) > new Date() &&
              a.status === "scheduled"
          ).length || 0,
      };

      stats.pendingPayment = stats.totalBilled - stats.totalPaid;

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      console.error("Error fetching case stats:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to fetch case statistics",
      };
    }
  }

  /**
   * Get active cases
   * @returns {Promise<Object>} Active cases
   */
  async getActiveCases() {
    try {
      const cases = await Case.findAll({
        where: {
          status: {
            [Op.in]: ["first_instance", "in_settlement", "in_appeal"],
          },
        },
        include: [
          { model: Client, as: "client" },
          { model: User, as: "assignedLawyer" },
        ],
        order: [
          ["priority", "DESC"],
          ["createdAt", "DESC"],
        ],
      });

      return {
        success: true,
        data: cases.map((cas) => cas.toJSON()),
        count: cases.length,
      };
    } catch (error) {
      console.error("Error fetching active cases:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to fetch active cases",
      };
    }
  }

  /**
   * Get upcoming hearings
   * @param {number} days - Number of days to look ahead
   * @returns {Promise<Object>} Upcoming hearings
   */
  async getUpcomingHearings(days = 30) {
    try {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + days);

      // This function is deprecated - nextHearingDate field has been removed
      // Use court sessions to track upcoming hearings instead
      return {
        success: true,
        data: [],
        count: 0,
      };
    } catch (error) {
      console.error("Error fetching upcoming hearings:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to fetch upcoming hearings",
      };
    }
  }

  /**
   * Search cases
   * @param {string} searchTerm - Search term
   * @returns {Promise<Object>} Search results
   */
  async searchCases(searchTerm) {
    try {
      if (!searchTerm) {
        return this.getAllCases();
      }

      const cases = await Case.findAll({
        where: {
          [Op.or]: [
            { caseNumber: { [Op.like]: `%${searchTerm}%` } },
            { title: { [Op.like]: `%${searchTerm}%` } },
            { description: { [Op.like]: `%${searchTerm}%` } },
            { court: { [Op.like]: `%${searchTerm}%` } },
            { judge: { [Op.like]: `%${searchTerm}%` } },
            { opposingParty: { [Op.like]: `%${searchTerm}%` } },
            { opposingLawyer: { [Op.like]: `%${searchTerm}%` } },
          ],
        },
        include: [
          { model: Client, as: "client" },
          { model: User, as: "assignedLawyer" },
        ],
        order: [["createdAt", "DESC"]],
      });

      return {
        success: true,
        data: cases.map((cas) => cas.toJSON()),
        count: cases.length,
      };
    } catch (error) {
      console.error("Error searching cases:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to search cases",
      };
    }
  }

  /**
   * Get cases by client
   * @param {number} clientId - Client ID
   * @returns {Promise<Object>} Client cases
   */
  async getCasesByClient(clientId) {
    try {
      if (!clientId) {
        throw new Error("Client ID is required");
      }

      const cases = await Case.findAll({
        where: { clientId },
        include: [{ model: User, as: "assignedLawyer" }],
        order: [["createdAt", "DESC"]],
      });

      return {
        success: true,
        data: cases.map((cas) => cas.toJSON()),
        count: cases.length,
      };
    } catch (error) {
      console.error("Error fetching cases by client:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to fetch cases by client",
      };
    }
  }

  /**
   * Close a case
   * @param {number} id - Case ID
   * @param {string} outcome - Case outcome
   * @returns {Promise<Object>} Result
   */
  async closeCase(id, outcome = "closed") {
    try {
      const validOutcomes = ["won", "lost", "settled", "closed"];
      if (!validOutcomes.includes(outcome)) {
        throw new Error("Invalid outcome status");
      }

      return await this.updateCase(id, {
        status: outcome,
        endDate: new Date().toISOString().split("T")[0],
      });
    } catch (error) {
      console.error("Error closing case:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to close case",
      };
    }
  }

  /**
   * Reopen a case
   * @param {number} id - Case ID
   * @returns {Promise<Object>} Result
   */
  async reopenCase(id) {
    try {
      return await this.updateCase(id, {
        status: "first_instance",
        endDate: null,
      });
    } catch (error) {
      console.error("Error reopening case:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to reopen case",
      };
    }
  }
}

export default new CaseService();
