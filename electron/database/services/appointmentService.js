import { Op } from "sequelize";
import Appointment from "../models/Appointment.js";
import Client from "../models/Client.js";
import Case from "../models/Case.js";

/**
 * Appointment Service
 * Handles all business logic for appointment operations
 */

class AppointmentService {
  /**
   * Create a new appointment
   * @param {Object} appointmentData - Appointment data
   * @returns {Promise<Object>} Created appointment
   */
  async createAppointment(appointmentData) {
    try {
      // Validate required fields
      if (!appointmentData.title) {
        throw new Error("Appointment title is required");
      }
      if (!appointmentData.appointmentDate) {
        throw new Error("Appointment date is required");
      }

      // Validate appointment date is in the future (optional)
      const appointmentDate = new Date(appointmentData.appointmentDate);
      if (appointmentDate < new Date() && !appointmentData.allowPast) {
        throw new Error("Appointment date cannot be in the past");
      }

      // Verify client exists if clientId is provided
      if (appointmentData.clientId) {
        const client = await Client.findByPk(appointmentData.clientId);
        if (!client) {
          throw new Error("Client not found");
        }
      }

      // Verify case exists if caseId is provided
      if (appointmentData.caseId) {
        const caseData = await Case.findByPk(appointmentData.caseId);
        if (!caseData) {
          throw new Error("Case not found");
        }
      }

      const appointment = await Appointment.create(appointmentData);

      return {
        success: true,
        data: appointment,
        message: "Appointment created successfully",
      };
    } catch (error) {
      console.error("Error creating appointment:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to create appointment",
      };
    }
  }

  /**
   * Get all appointments with optional filters
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>} List of appointments
   */
  async getAllAppointments(filters = {}) {
    try {
      const where = {};

      // Apply filters
      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.appointmentType) {
        where.appointmentType = filters.appointmentType;
      }

      if (filters.clientId) {
        where.clientId = filters.clientId;
      }

      if (filters.caseId) {
        where.caseId = filters.caseId;
      }

      if (filters.startDate) {
        where.appointmentDate = {
          [Op.gte]: filters.startDate,
        };
      }

      if (filters.endDate) {
        if (where.appointmentDate) {
          where.appointmentDate[Op.lte] = filters.endDate;
        } else {
          where.appointmentDate = {
            [Op.lte]: filters.endDate,
          };
        }
      }

      if (filters.search) {
        where[Op.or] = [
          { title: { [Op.like]: `%${filters.search}%` } },
          { location: { [Op.like]: `%${filters.search}%` } },
          { notes: { [Op.like]: `%${filters.search}%` } },
        ];
      }

      const appointments = await Appointment.findAll({
        where,
        include: [
          { model: Client, as: "client" },
          { model: Case, as: "case" },
        ],
        order: [["appointmentDate", "ASC"]],
      });

      return {
        success: true,
        data: appointments,
        count: appointments.length,
      };
    } catch (error) {
      console.error("Error fetching appointments:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to fetch appointments",
      };
    }
  }

  /**
   * Get an appointment by ID
   * @param {number} id - Appointment ID
   * @returns {Promise<Object>} Appointment data
   */
  async getAppointmentById(id) {
    try {
      if (!id) {
        throw new Error("Appointment ID is required");
      }

      const appointment = await Appointment.findByPk(id, {
        include: [
          { model: Client, as: "client" },
          { model: Case, as: "case" },
        ],
      });

      if (!appointment) {
        throw new Error("Appointment not found");
      }

      return {
        success: true,
        data: appointment,
      };
    } catch (error) {
      console.error("Error fetching appointment:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to fetch appointment",
      };
    }
  }

  /**
   * Update an appointment
   * @param {number} id - Appointment ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated appointment
   */
  async updateAppointment(id, updateData) {
    try {
      if (!id) {
        throw new Error("Appointment ID is required");
      }

      const appointment = await Appointment.findByPk(id);
      if (!appointment) {
        throw new Error("Appointment not found");
      }

      await appointment.update(updateData);

      return {
        success: true,
        data: appointment,
        message: "Appointment updated successfully",
      };
    } catch (error) {
      console.error("Error updating appointment:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to update appointment",
      };
    }
  }

  /**
   * Delete an appointment
   * @param {number} id - Appointment ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteAppointment(id) {
    try {
      if (!id) {
        throw new Error("Appointment ID is required");
      }

      const appointment = await Appointment.findByPk(id);
      if (!appointment) {
        throw new Error("Appointment not found");
      }

      await appointment.destroy();

      return {
        success: true,
        message: "Appointment deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting appointment:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to delete appointment",
      };
    }
  }

  /**
   * Get upcoming appointments
   * @param {number} days - Number of days to look ahead
   * @returns {Promise<Object>} Upcoming appointments
   */
  async getUpcomingAppointments(days = 7) {
    try {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + days);

      const appointments = await Appointment.findAll({
        where: {
          appointmentDate: {
            [Op.between]: [new Date(), endDate],
          },
          status: "scheduled",
        },
        include: [
          { model: Client, as: "client" },
          { model: Case, as: "case" },
        ],
        order: [["appointmentDate", "ASC"]],
      });

      return {
        success: true,
        data: appointments,
        count: appointments.length,
      };
    } catch (error) {
      console.error("Error fetching upcoming appointments:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to fetch upcoming appointments",
      };
    }
  }

  /**
   * Get today's appointments
   * @returns {Promise<Object>} Today's appointments
   */
  async getTodayAppointments() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const appointments = await Appointment.findAll({
        where: {
          appointmentDate: {
            [Op.between]: [today, tomorrow],
          },
        },
        include: [
          { model: Client, as: "client" },
          { model: Case, as: "case" },
        ],
        order: [["appointmentDate", "ASC"]],
      });

      return {
        success: true,
        data: appointments,
        count: appointments.length,
      };
    } catch (error) {
      console.error("Error fetching today's appointments:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to fetch today's appointments",
      };
    }
  }

  /**
   * Get appointments for a specific date
   * @param {string} date - Date in YYYY-MM-DD format
   * @returns {Promise<Object>} Appointments for the date
   */
  async getAppointmentsByDate(date) {
    try {
      if (!date) {
        throw new Error("Date is required");
      }

      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      const appointments = await Appointment.findAll({
        where: {
          appointmentDate: {
            [Op.between]: [startDate, endDate],
          },
        },
        include: [
          { model: Client, as: "client" },
          { model: Case, as: "case" },
        ],
        order: [["appointmentDate", "ASC"]],
      });

      return {
        success: true,
        data: appointments,
        count: appointments.length,
      };
    } catch (error) {
      console.error("Error fetching appointments by date:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to fetch appointments by date",
      };
    }
  }

  /**
   * Cancel an appointment
   * @param {number} id - Appointment ID
   * @returns {Promise<Object>} Result
   */
  async cancelAppointment(id) {
    try {
      return await this.updateAppointment(id, { status: "cancelled" });
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to cancel appointment",
      };
    }
  }

  /**
   * Complete an appointment
   * @param {number} id - Appointment ID
   * @returns {Promise<Object>} Result
   */
  async completeAppointment(id) {
    try {
      return await this.updateAppointment(id, { status: "completed" });
    } catch (error) {
      console.error("Error completing appointment:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to complete appointment",
      };
    }
  }

  /**
   * Reschedule an appointment
   * @param {number} id - Appointment ID
   * @param {string} newDate - New appointment date
   * @returns {Promise<Object>} Result
   */
  async rescheduleAppointment(id, newDate) {
    try {
      if (!newDate) {
        throw new Error("New date is required");
      }

      return await this.updateAppointment(id, {
        appointmentDate: newDate,
        status: "rescheduled",
      });
    } catch (error) {
      console.error("Error rescheduling appointment:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to reschedule appointment",
      };
    }
  }

  /**
   * Mark reminder as sent
   * @param {number} id - Appointment ID
   * @returns {Promise<Object>} Result
   */
  async markReminderSent(id) {
    try {
      return await this.updateAppointment(id, { reminderSent: true });
    } catch (error) {
      console.error("Error marking reminder as sent:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to mark reminder as sent",
      };
    }
  }

  /**
   * Get appointments needing reminders
   * @param {number} hours - Hours before appointment to send reminder
   * @returns {Promise<Object>} Appointments needing reminders
   */
  async getAppointmentsNeedingReminders(hours = 24) {
    try {
      const now = new Date();
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + hours);

      const appointments = await Appointment.findAll({
        where: {
          appointmentDate: {
            [Op.between]: [now, futureDate],
          },
          status: "scheduled",
          reminderSent: false,
        },
        include: [
          { model: Client, as: "client" },
          { model: Case, as: "case" },
        ],
        order: [["appointmentDate", "ASC"]],
      });

      return {
        success: true,
        data: appointments,
        count: appointments.length,
      };
    } catch (error) {
      console.error("Error fetching appointments needing reminders:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to fetch appointments needing reminders",
      };
    }
  }

  /**
   * Get appointments by client
   * @param {number} clientId - Client ID
   * @returns {Promise<Object>} Client appointments
   */
  async getAppointmentsByClient(clientId) {
    try {
      if (!clientId) {
        throw new Error("Client ID is required");
      }

      const appointments = await Appointment.findAll({
        where: { clientId },
        include: [
          { model: Case, as: "case" },
        ],
        order: [["appointmentDate", "DESC"]],
      });

      return {
        success: true,
        data: appointments,
        count: appointments.length,
      };
    } catch (error) {
      console.error("Error fetching appointments by client:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to fetch appointments by client",
      };
    }
  }

  /**
   * Get appointments by case
   * @param {number} caseId - Case ID
   * @returns {Promise<Object>} Case appointments
   */
  async getAppointmentsByCase(caseId) {
    try {
      if (!caseId) {
        throw new Error("Case ID is required");
      }

      const appointments = await Appointment.findAll({
        where: { caseId },
        include: [
          { model: Client, as: "client" },
        ],
        order: [["appointmentDate", "DESC"]],
      });

      return {
        success: true,
        data: appointments,
        count: appointments.length,
      };
    } catch (error) {
      console.error("Error fetching appointments by case:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to fetch appointments by case",
      };
    }
  }
}

export default new AppointmentService();
