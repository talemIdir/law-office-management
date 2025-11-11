import { Op } from "sequelize";
import Client from "../models/Client.js";
import Case from "../models/Case.js";
import Invoice from "../models/Invoice.js";
import Document from "../models/Document.js";
import Appointment from "../models/Appointment.js";

/**
 * Client Service
 * Handles all business logic for client operations
 */

class ClientService {
  /**
   * Create a new client
   * @param {Object} clientData - Client data
   * @returns {Promise<Object>} Created client
   */
  async createClient(clientData) {
    try {
      // Validate required fields
      if (!clientData.phone) {
        throw new Error("Phone number is required");
      }

      // Validate type-specific required fields
      if (clientData.type === "individual") {
        if (!clientData.firstName || !clientData.lastName) {
          throw new Error("First name and last name are required for individual clients");
        }
      } else if (clientData.type === "company") {
        if (!clientData.companyName) {
          throw new Error("Company name is required for company clients");
        }
      }

      // Check for duplicate national ID if provided
      if (clientData.nationalId) {
        const existing = await Client.findOne({
          where: { nationalId: clientData.nationalId },
        });
        if (existing) {
          throw new Error("A client with this national ID already exists");
        }
      }

      const client = await Client.create(clientData);
      return {
        success: true,
        data: client,
        message: "Client created successfully",
      };
    } catch (error) {
      console.error("Error creating client:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to create client",
      };
    }
  }

  /**
   * Get all clients with optional filters
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>} List of clients
   */
  async getAllClients(filters = {}) {
    try {
      const where = {};

      // Apply filters
      if (filters.type) {
        where.type = filters.type;
      }

      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.search) {
        where[Op.or] = [
          { firstName: { [Op.like]: `%${filters.search}%` } },
          { lastName: { [Op.like]: `%${filters.search}%` } },
          { companyName: { [Op.like]: `%${filters.search}%` } },
          { email: { [Op.like]: `%${filters.search}%` } },
          { phone: { [Op.like]: `%${filters.search}%` } },
          { nationalId: { [Op.like]: `%${filters.search}%` } },
        ];
      }

      if (filters.city) {
        where.city = { [Op.like]: `%${filters.city}%` };
      }

      if (filters.wilaya) {
        where.wilaya = filters.wilaya;
      }

      const clients = await Client.findAll({
        where,
        order: [["createdAt", "DESC"]],
        include: filters.includeCases
          ? [
              { model: Case, as: "cases" },
              { model: Invoice, as: "invoices" },
              { model: Appointment, as: "appointments" },
            ]
          : [],
      });

      return {
        success: true,
        data: clients,
        count: clients.length,
      };
    } catch (error) {
      console.error("Error fetching clients:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to fetch clients",
      };
    }
  }

  /**
   * Get a client by ID
   * @param {number} id - Client ID
   * @param {boolean} includeRelations - Include related data
   * @returns {Promise<Object>} Client data
   */
  async getClientById(id, includeRelations = false) {
    try {
      if (!id) {
        throw new Error("Client ID is required");
      }

      const include = includeRelations
        ? [
            { model: Case, as: "cases" },
            { model: Invoice, as: "invoices" },
            { model: Document, as: "documents" },
            { model: Appointment, as: "appointments" },
          ]
        : [];

      const client = await Client.findByPk(id, { include });

      if (!client) {
        throw new Error("Client not found");
      }

      return {
        success: true,
        data: client,
      };
    } catch (error) {
      console.error("Error fetching client:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to fetch client",
      };
    }
  }

  /**
   * Update a client
   * @param {number} id - Client ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated client
   */
  async updateClient(id, updateData) {
    try {
      if (!id) {
        throw new Error("Client ID is required");
      }

      const client = await Client.findByPk(id);
      if (!client) {
        throw new Error("Client not found");
      }

      // Check for duplicate national ID if updating
      if (updateData.nationalId && updateData.nationalId !== client.nationalId) {
        const existing = await Client.findOne({
          where: {
            nationalId: updateData.nationalId,
            id: { [Op.ne]: id },
          },
        });
        if (existing) {
          throw new Error("A client with this national ID already exists");
        }
      }

      await client.update(updateData);

      return {
        success: true,
        data: client,
        message: "Client updated successfully",
      };
    } catch (error) {
      console.error("Error updating client:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to update client",
      };
    }
  }

  /**
   * Delete a client
   * @param {number} id - Client ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteClient(id) {
    try {
      if (!id) {
        throw new Error("Client ID is required");
      }

      const client = await Client.findByPk(id);
      if (!client) {
        throw new Error("Client not found");
      }

      await client.destroy();

      return {
        success: true,
        message: "Client deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting client:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to delete client",
      };
    }
  }

  /**
   * Get client statistics
   * @param {number} id - Client ID
   * @returns {Promise<Object>} Client statistics
   */
  async getClientStats(id) {
    try {
      if (!id) {
        throw new Error("Client ID is required");
      }

      const client = await Client.findByPk(id, {
        include: [
          { model: Case, as: "cases" },
          { model: Invoice, as: "invoices" },
          { model: Appointment, as: "appointments" },
        ],
      });

      if (!client) {
        throw new Error("Client not found");
      }

      const stats = {
        totalCases: client.cases?.length || 0,
        activeCases: client.cases?.filter((c) => c.status === "open" || c.status === "in_progress").length || 0,
        totalInvoices: client.invoices?.length || 0,
        totalAmount: client.invoices?.reduce((sum, inv) => sum + parseFloat(inv.totalAmount || 0), 0) || 0,
        paidAmount: client.invoices?.reduce((sum, inv) => sum + parseFloat(inv.paidAmount || 0), 0) || 0,
        pendingAmount: 0,
        totalAppointments: client.appointments?.length || 0,
        upcomingAppointments: client.appointments?.filter(
          (a) => new Date(a.appointmentDate) > new Date() && a.status === "scheduled"
        ).length || 0,
      };

      stats.pendingAmount = stats.totalAmount - stats.paidAmount;

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      console.error("Error fetching client stats:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to fetch client statistics",
      };
    }
  }

  /**
   * Search clients
   * @param {string} searchTerm - Search term
   * @returns {Promise<Object>} Search results
   */
  async searchClients(searchTerm) {
    try {
      if (!searchTerm) {
        return this.getAllClients();
      }

      const clients = await Client.findAll({
        where: {
          [Op.or]: [
            { firstName: { [Op.like]: `%${searchTerm}%` } },
            { lastName: { [Op.like]: `%${searchTerm}%` } },
            { companyName: { [Op.like]: `%${searchTerm}%` } },
            { email: { [Op.like]: `%${searchTerm}%` } },
            { phone: { [Op.like]: `%${searchTerm}%` } },
            { nationalId: { [Op.like]: `%${searchTerm}%` } },
            { city: { [Op.like]: `%${searchTerm}%` } },
          ],
        },
        order: [["createdAt", "DESC"]],
      });

      return {
        success: true,
        data: clients,
        count: clients.length,
      };
    } catch (error) {
      console.error("Error searching clients:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to search clients",
      };
    }
  }

  /**
   * Get active clients
   * @returns {Promise<Object>} Active clients
   */
  async getActiveClients() {
    try {
      const clients = await Client.findAll({
        where: { status: "active" },
        order: [["createdAt", "DESC"]],
      });

      return {
        success: true,
        data: clients,
        count: clients.length,
      };
    } catch (error) {
      console.error("Error fetching active clients:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to fetch active clients",
      };
    }
  }

  /**
   * Archive a client
   * @param {number} id - Client ID
   * @returns {Promise<Object>} Result
   */
  async archiveClient(id) {
    try {
      return await this.updateClient(id, { status: "archived" });
    } catch (error) {
      console.error("Error archiving client:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to archive client",
      };
    }
  }

  /**
   * Restore an archived client
   * @param {number} id - Client ID
   * @returns {Promise<Object>} Result
   */
  async restoreClient(id) {
    try {
      return await this.updateClient(id, { status: "active" });
    } catch (error) {
      console.error("Error restoring client:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to restore client",
      };
    }
  }
}

export default new ClientService();
