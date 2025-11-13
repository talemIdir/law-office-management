import { Op } from "sequelize";
import Expense from "../models/Expense.js";
import Case from "../models/Case.js";

/**
 * Expense Service
 * Handles all business logic for expense operations
 */

class ExpenseService {
  /**
   * Create a new expense
   * @param {Object} expenseData - Expense data
   * @returns {Promise<Object>} Created expense
   */
  async createExpense(expenseData) {
    try {
      // Validate required fields
      if (!expenseData.category) {
        throw new Error("Expense category is required");
      }
      if (!expenseData.description) {
        throw new Error("Expense description is required");
      }
      if (!expenseData.amount) {
        throw new Error("Expense amount is required");
      }

      const amount = parseFloat(expenseData.amount);
      if (amount <= 0) {
        throw new Error("Expense amount must be greater than 0");
      }

      // Verify case exists if caseId is provided
      if (expenseData.caseId) {
        const caseData = await Case.findByPk(expenseData.caseId);
        if (!caseData) {
          throw new Error("Case not found");
        }
      }

      const expense = await Expense.create(expenseData);

      return {
        success: true,
        data: expense.toJSON(),
        message: "Expense created successfully",
      };
    } catch (error) {
      console.error("Error creating expense:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to create expense",
      };
    }
  }

  /**
   * Get all expenses with optional filters
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>} List of expenses
   */
  async getAllExpenses(filters = {}) {
    try {
      const where = {};

      // Apply filters
      if (filters.category) {
        where.category = filters.category;
      }

      if (filters.caseId) {
        where.caseId = filters.caseId;
      }

      if (filters.paymentMethod) {
        where.paymentMethod = filters.paymentMethod;
      }

      if (filters.startDate) {
        where.expenseDate = {
          [Op.gte]: filters.startDate,
        };
      }

      if (filters.endDate) {
        if (where.expenseDate) {
          where.expenseDate[Op.lte] = filters.endDate;
        } else {
          where.expenseDate = {
            [Op.lte]: filters.endDate,
          };
        }
      }

      if (filters.search) {
        where[Op.or] = [
          { description: { [Op.like]: `%${filters.search}%` } },
          { reference: { [Op.like]: `%${filters.search}%` } },
          { notes: { [Op.like]: `%${filters.search}%` } },
        ];
      }

      const expenses = await Expense.findAll({
        where,
        include: [{ model: Case, as: "case" }],
        order: [["expenseDate", "DESC"]],
      });

      return {
        success: true,
        data: expenses.map((expense) => expense.toJSON()),
        count: expenses.length,
      };
    } catch (error) {
      console.error("Error fetching expenses:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to fetch expenses",
      };
    }
  }

  /**
   * Get an expense by ID
   * @param {number} id - Expense ID
   * @returns {Promise<Object>} Expense data
   */
  async getExpenseById(id) {
    try {
      if (!id) {
        throw new Error("Expense ID is required");
      }

      const expense = await Expense.findByPk(id, {
        include: [{ model: Case, as: "case" }],
      });

      if (!expense) {
        throw new Error("Expense not found");
      }

      return {
        success: true,
        data: expense.toJSON(),
      };
    } catch (error) {
      console.error("Error fetching expense:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to fetch expense",
      };
    }
  }

  /**
   * Update an expense
   * @param {number} id - Expense ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated expense
   */
  async updateExpense(id, updateData) {
    try {
      if (!id) {
        throw new Error("Expense ID is required");
      }

      const expense = await Expense.findByPk(id);
      if (!expense) {
        throw new Error("Expense not found");
      }

      // Validate amount if updating
      if (updateData.amount) {
        const amount = parseFloat(updateData.amount);
        if (amount <= 0) {
          throw new Error("Expense amount must be greater than 0");
        }
      }

      await expense.update(updateData);

      return {
        success: true,
        data: expense.toJSON(),
        message: "Expense updated successfully",
      };
    } catch (error) {
      console.error("Error updating expense:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to update expense",
      };
    }
  }

  /**
   * Delete an expense
   * @param {number} id - Expense ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteExpense(id) {
    try {
      if (!id) {
        throw new Error("Expense ID is required");
      }

      const expense = await Expense.findByPk(id);
      if (!expense) {
        throw new Error("Expense not found");
      }

      await expense.destroy();

      return {
        success: true,
        message: "Expense deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting expense:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to delete expense",
      };
    }
  }

  /**
   * Get expenses by case
   * @param {number} caseId - Case ID
   * @returns {Promise<Object>} Case expenses
   */
  async getExpensesByCase(caseId) {
    try {
      if (!caseId) {
        throw new Error("Case ID is required");
      }

      const expenses = await Expense.findAll({
        where: { caseId },
        order: [["expenseDate", "DESC"]],
      });

      const total = expenses.reduce(
        (sum, exp) => sum + parseFloat(exp.amount || 0),
        0
      );

      return {
        success: true,
        data: expenses.map((expense) => expense.toJSON()),
        count: expenses.length,
        total,
      };
    } catch (error) {
      console.error("Error fetching expenses by case:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to fetch expenses by case",
      };
    }
  }

  /**
   * Get expense statistics
   * @param {Object} filters - Filter options (startDate, endDate)
   * @returns {Promise<Object>} Expense statistics
   */
  async getExpenseStats(filters = {}) {
    try {
      const where = {};

      if (filters.startDate) {
        where.expenseDate = {
          [Op.gte]: filters.startDate,
        };
      }

      if (filters.endDate) {
        if (where.expenseDate) {
          where.expenseDate[Op.lte] = filters.endDate;
        } else {
          where.expenseDate = {
            [Op.lte]: filters.endDate,
          };
        }
      }

      const expenses = await Expense.findAll({ where });

      const stats = {
        totalExpenses: expenses.length,
        totalAmount: expenses.reduce(
          (sum, exp) => sum + parseFloat(exp.amount || 0),
          0
        ),
        byCategory: {
          court_fees: expenses
            .filter((e) => e.category === "court_fees")
            .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0),
          transportation: expenses
            .filter((e) => e.category === "transportation")
            .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0),
          documentation: expenses
            .filter((e) => e.category === "documentation")
            .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0),
          office_supplies: expenses
            .filter((e) => e.category === "office_supplies")
            .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0),
          utilities: expenses
            .filter((e) => e.category === "utilities")
            .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0),
          salaries: expenses
            .filter((e) => e.category === "salaries")
            .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0),
          other: expenses
            .filter((e) => e.category === "other")
            .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0),
        },
        byPaymentMethod: {
          cash: expenses
            .filter((e) => e.paymentMethod === "cash")
            .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0),
          check: expenses
            .filter((e) => e.paymentMethod === "check")
            .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0),
          bank_transfer: expenses
            .filter((e) => e.paymentMethod === "bank_transfer")
            .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0),
          credit_card: expenses
            .filter((e) => e.paymentMethod === "credit_card")
            .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0),
          other: expenses
            .filter((e) => e.paymentMethod === "other")
            .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0),
        },
      };

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      console.error("Error fetching expense stats:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to fetch expense statistics",
      };
    }
  }

  /**
   * Get recent expenses
   * @param {number} limit - Number of expenses to retrieve
   * @returns {Promise<Object>} Recent expenses
   */
  async getRecentExpenses(limit = 10) {
    try {
      const expenses = await Expense.findAll({
        include: [{ model: Case, as: "case" }],
        order: [["expenseDate", "DESC"]],
        limit,
      });

      return {
        success: true,
        data: expenses.map((expense) => expense.toJSON()),
        count: expenses.length,
      };
    } catch (error) {
      console.error("Error fetching recent expenses:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to fetch recent expenses",
      };
    }
  }

  /**
   * Get expenses by category
   * @param {string} category - Expense category
   * @returns {Promise<Object>} Expenses by category
   */
  async getExpensesByCategory(category) {
    try {
      if (!category) {
        throw new Error("Category is required");
      }

      const expenses = await Expense.findAll({
        where: { category },
        include: [{ model: Case, as: "case" }],
        order: [["expenseDate", "DESC"]],
      });

      const total = expenses.reduce(
        (sum, exp) => sum + parseFloat(exp.amount || 0),
        0
      );

      return {
        success: true,
        data: expenses.map((expense) => expense.toJSON()),
        count: expenses.length,
        total,
      };
    } catch (error) {
      console.error("Error fetching expenses by category:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to fetch expenses by category",
      };
    }
  }
}

export default new ExpenseService();
