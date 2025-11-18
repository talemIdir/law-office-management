import { Op } from "sequelize";
import CourtSession from "../models/CourtSession.js";
import Case from "../models/Case.js";

/**
 * Court Session Service
 * Handles all business logic for court session operations
 */

class CourtSessionService {
  /**
   * Create a new court session
   * @param {Object} sessionData - Court session data
   * @returns {Promise<Object>} Created court session
   */
  async createCourtSession(sessionData) {
    try {
      // Validate required fields
      if (!sessionData.sessionDate) {
        throw new Error("Session date is required");
      }
      if (!sessionData.caseId) {
        throw new Error("Case ID is required");
      }

      // Verify case exists
      const caseData = await Case.findByPk(sessionData.caseId);
      if (!caseData) {
        throw new Error("Case not found");
      }

      const session = await CourtSession.create(sessionData);

      return {
        success: true,
        data: session.toJSON(),
        message: "Court session created successfully",
      };
    } catch (error) {
      console.error("Error creating court session:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to create court session",
      };
    }
  }

  /**
   * Get all court sessions with optional filters
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>} List of court sessions
   */
  async getAllCourtSessions(filters = {}) {
    try {
      const where = {};

      // Apply filters
      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.caseId) {
        where.caseId = filters.caseId;
      }

      if (filters.startDate) {
        where.sessionDate = {
          [Op.gte]: filters.startDate,
        };
      }

      if (filters.endDate) {
        if (where.sessionDate) {
          where.sessionDate[Op.lte] = filters.endDate;
        } else {
          where.sessionDate = {
            [Op.lte]: filters.endDate,
          };
        }
      }

      if (filters.search) {
        where[Op.or] = [
          { court: { [Op.like]: `%${filters.search}%` } },
          { courtRoom: { [Op.like]: `%${filters.search}%` } },
          { judge: { [Op.like]: `%${filters.search}%` } },
          { attendees: { [Op.like]: `%${filters.search}%` } },
          { outcome: { [Op.like]: `%${filters.search}%` } },
        ];
      }

      const sessions = await CourtSession.findAll({
        where,
        include: [
          {
            model: Case,
            as: "case",
            include: [
              {
                model: (await import("../models/Client.js")).default,
                as: "client",
              },
            ],
          },
        ],
        order: [["sessionDate", "DESC"]],
      });

      return {
        success: true,
        data: sessions.map((session) => session.toJSON()),
        count: sessions.length,
      };
    } catch (error) {
      console.error("Error fetching court sessions:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to fetch court sessions",
      };
    }
  }

  /**
   * Get a court session by ID
   * @param {number} id - Court session ID
   * @returns {Promise<Object>} Court session data
   */
  async getCourtSessionById(id) {
    try {
      if (!id) {
        throw new Error("Court session ID is required");
      }

      const session = await CourtSession.findByPk(id, {
        include: [
          {
            model: Case,
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

      if (!session) {
        throw new Error("Court session not found");
      }

      return {
        success: true,
        data: session.toJSON(),
      };
    } catch (error) {
      console.error("Error fetching court session:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to fetch court session",
      };
    }
  }

  /**
   * Update a court session
   * @param {number} id - Court session ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated court session
   */
  async updateCourtSession(id, updateData) {
    try {
      if (!id) {
        throw new Error("Court session ID is required");
      }

      const session = await CourtSession.findByPk(id, {
        include: [{ model: Case, as: "case" }],
      });

      if (!session) {
        throw new Error("Court session not found");
      }

      await session.update(updateData);

      return {
        success: true,
        data: session.toJSON(),
        message: "Court session updated successfully",
      };
    } catch (error) {
      console.error("Error updating court session:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to update court session",
      };
    }
  }

  /**
   * Delete a court session
   * @param {number} id - Court session ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteCourtSession(id) {
    try {
      if (!id) {
        throw new Error("Court session ID is required");
      }

      const session = await CourtSession.findByPk(id);
      if (!session) {
        throw new Error("Court session not found");
      }

      await session.destroy();

      return {
        success: true,
        message: "Court session deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting court session:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to delete court session",
      };
    }
  }

  /**
   * Get upcoming court sessions
   * @param {number} days - Number of days to look ahead
   * @returns {Promise<Object>} Upcoming court sessions
   */
  async getUpcomingSessions(days = 30) {
    try {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + days);

      const sessions = await CourtSession.findAll({
        where: {
          sessionDate: {
            [Op.between]: [new Date(), endDate],
          },
        },
        include: [
          {
            model: Case,
            as: "case",
            include: [
              {
                model: (await import("../models/Client.js")).default,
                as: "client",
              },
            ],
          },
        ],
        order: [["sessionDate", "ASC"]],
      });

      return {
        success: true,
        data: sessions.map((session) => session.toJSON()),
        count: sessions.length,
      };
    } catch (error) {
      console.error("Error fetching upcoming sessions:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to fetch upcoming sessions",
      };
    }
  }

  /**
   * Get today's court sessions
   * @returns {Promise<Object>} Today's court sessions
   */
  async getTodaySessions() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const sessions = await CourtSession.findAll({
        where: {
          sessionDate: {
            [Op.between]: [today, tomorrow],
          },
        },
        include: [
          {
            model: Case,
            as: "case",
            include: [
              {
                model: (await import("../models/Client.js")).default,
                as: "client",
              },
            ],
          },
        ],
        order: [["sessionDate", "ASC"]],
      });

      return {
        success: true,
        data: sessions.map((session) => session.toJSON()),
        count: sessions.length,
      };
    } catch (error) {
      console.error("Error fetching today's sessions:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to fetch today's sessions",
      };
    }
  }

  /**
   * Get court sessions by case
   * @param {number} caseId - Case ID
   * @returns {Promise<Object>} Case court sessions
   */
  async getSessionsByCase(caseId) {
    try {
      if (!caseId) {
        throw new Error("Case ID is required");
      }

      const sessions = await CourtSession.findAll({
        where: { caseId },
        order: [["sessionDate", "DESC"]],
      });

      return {
        success: true,
        data: sessions.map((session) => session.toJSON()),
        count: sessions.length,
      };
    } catch (error) {
      console.error("Error fetching sessions by case:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to fetch sessions by case",
      };
    }
  }

  /**
   * Postpone a court session
   * @param {number} id - Court session ID
   * @param {string} newDate - New session date
   * @returns {Promise<Object>} Result
   */
  async postponeSession(id, newDate) {
    try {
      if (!id) {
        throw new Error("Court session ID is required");
      }
      if (!newDate) {
        throw new Error("New session date is required");
      }

      return await this.updateCourtSession(id, {
        status: "مؤجلة",
      });
    } catch (error) {
      console.error("Error postponing session:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to postpone session",
      };
    }
  }

  /**
   * Get court session statistics
   * @param {Object} filters - Filter options (startDate, endDate)
   * @returns {Promise<Object>} Court session statistics
   */
  async getSessionStats(filters = {}) {
    try {
      const where = {};

      if (filters.startDate) {
        where.sessionDate = {
          [Op.gte]: filters.startDate,
        };
      }

      if (filters.endDate) {
        if (where.sessionDate) {
          where.sessionDate[Op.lte] = filters.endDate;
        } else {
          where.sessionDate = {
            [Op.lte]: filters.endDate,
          };
        }
      }

      const sessions = await CourtSession.findAll({ where });

      const stats = {
        totalSessions: sessions.length,
        في_التقرير: sessions.filter((s) => s.status === "في التقرير").length,
        في_المرافعة: sessions.filter((s) => s.status === "في المرافعة").length,
        لجواب_الخصم: sessions.filter((s) => s.status === "لجواب الخصم").length,
        لجوابنا: sessions.filter((s) => s.status === "لجوابنا").length,
        في_المداولة: sessions.filter((s) => s.status === "في المداولة").length,
        مؤجلة: sessions.filter((s) => s.status === "مؤجلة").length,
        جلسة_المحاكمة: sessions.filter((s) => s.status === "جلسة المحاكمة")
          .length,
      };

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      console.error("Error fetching session stats:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to fetch session statistics",
      };
    }
  }
}

export default new CourtSessionService();
