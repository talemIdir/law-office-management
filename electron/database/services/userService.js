import { Op } from "sequelize";
import User from "../models/User.js";
import Case from "../models/Case.js";
import bcrypt from "bcrypt";

/**
 * User Service
 * Handles all business logic for user operations
 */

class UserService {
  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user
   */
  async createUser(userData) {
    try {
      // Validate required fields
      if (!userData.username) {
        throw new Error("Username is required");
      }
      if (!userData.password) {
        throw new Error("Password is required");
      }
      if (!userData.fullName) {
        throw new Error("Full name is required");
      }

      // Check for duplicate username
      const existingUsername = await User.findOne({
        where: { username: userData.username },
      });
      if (existingUsername) {
        throw new Error("Username already exists");
      }

      // Check for duplicate email if provided
      if (userData.email) {
        const existingEmail = await User.findOne({
          where: { email: userData.email },
        });
        if (existingEmail) {
          throw new Error("Email already exists");
        }
      }

      // Hash password before saving
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
      userData.password = hashedPassword;

      const user = await User.create(userData);

      // Remove password from response
      const userResponse = user.toJSON();
      delete userResponse.password;

      return {
        success: true,
        data: userResponse,
        message: "User created successfully",
      };
    } catch (error) {
      console.error("Error creating user:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to create user",
      };
    }
  }

  /**
   * Get all users with optional filters
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>} List of users
   */
  async getAllUsers(filters = {}) {
    try {
      const where = {};

      // Apply filters
      if (filters.role) {
        where.role = filters.role;
      }

      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.search) {
        where[Op.or] = [
          { username: { [Op.like]: `%${filters.search}%` } },
          { fullName: { [Op.like]: `%${filters.search}%` } },
          { email: { [Op.like]: `%${filters.search}%` } },
          { phone: { [Op.like]: `%${filters.search}%` } },
        ];
      }

      const users = await User.findAll({
        where,
        attributes: { exclude: ["password"] }, // Exclude password from response
        order: [["createdAt", "DESC"]],
      });

      return {
        success: true,
        data: users.map((user) => user.toJSON()),
        count: users.length,
      };
    } catch (error) {
      console.error("Error fetching users:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to fetch users",
      };
    }
  }

  /**
   * Get a user by ID
   * @param {number} id - User ID
   * @param {boolean} includePassword - Include password in response (for authentication)
   * @returns {Promise<Object>} User data
   */
  async getUserById(id, includePassword = false) {
    try {
      if (!id) {
        throw new Error("User ID is required");
      }

      const attributes = includePassword ? undefined : { exclude: ["password"] };

      const user = await User.findByPk(id, {
        attributes,
        include: [
          { model: Case, as: "assignedCases" },
        ],
      });

      if (!user) {
        throw new Error("User not found");
      }

      return {
        success: true,
        data: user.toJSON(),
      };
    } catch (error) {
      console.error("Error fetching user:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to fetch user",
      };
    }
  }

  /**
   * Update a user
   * @param {number} id - User ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated user
   */
  async updateUser(id, updateData) {
    try {
      if (!id) {
        throw new Error("User ID is required");
      }

      const user = await User.findByPk(id);
      if (!user) {
        throw new Error("User not found");
      }

      // Check for duplicate username if updating
      if (updateData.username && updateData.username !== user.username) {
        const existing = await User.findOne({
          where: {
            username: updateData.username,
            id: { [Op.ne]: id },
          },
        });
        if (existing) {
          throw new Error("Username already exists");
        }
      }

      // Check for duplicate email if updating
      if (updateData.email && updateData.email !== user.email) {
        const existing = await User.findOne({
          where: {
            email: updateData.email,
            id: { [Op.ne]: id },
          },
        });
        if (existing) {
          throw new Error("Email already exists");
        }
      }

      // Hash password if updating
      if (updateData.password) {
        const saltRounds = 10;
        updateData.password = await bcrypt.hash(updateData.password, saltRounds);
      }

      await user.update(updateData);

      // Remove password from response
      const userResponse = user.toJSON();
      delete userResponse.password;

      return {
        success: true,
        data: userResponse,
        message: "User updated successfully",
      };
    } catch (error) {
      console.error("Error updating user:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to update user",
      };
    }
  }

  /**
   * Delete a user
   * @param {number} id - User ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteUser(id) {
    try {
      if (!id) {
        throw new Error("User ID is required");
      }

      const user = await User.findByPk(id);
      if (!user) {
        throw new Error("User not found");
      }

      await user.destroy();

      return {
        success: true,
        message: "User deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting user:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to delete user",
      };
    }
  }

  /**
   * Authenticate a user
   * @param {string} username - Username
   * @param {string} password - Password
   * @returns {Promise<Object>} Authentication result
   */
  async authenticateUser(username, password) {
    try {
      if (!username) {
        throw new Error("Username is required");
      }
      if (!password) {
        throw new Error("Password is required");
      }

      const user = await User.findOne({
        where: { username },
      });

      if (!user) {
        throw new Error("Invalid username or password");
      }

      if (user.status !== "active") {
        throw new Error("User account is inactive");
      }

      // Compare password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new Error("Invalid username or password");
      }

      // Remove password from response
      const userResponse = user.toJSON();
      delete userResponse.password;

      return {
        success: true,
        data: userResponse,
        message: "Authentication successful",
      };
    } catch (error) {
      console.error("Error authenticating user:", error);
      return {
        success: false,
        error: error.message,
        message: "Authentication failed",
      };
    }
  }

  /**
   * Change user password
   * @param {number} id - User ID
   * @param {string} oldPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Result
   */
  async changePassword(id, oldPassword, newPassword) {
    try {
      if (!id) {
        throw new Error("User ID is required");
      }
      if (!oldPassword) {
        throw new Error("Current password is required");
      }
      if (!newPassword) {
        throw new Error("New password is required");
      }

      const user = await User.findByPk(id);
      if (!user) {
        throw new Error("User not found");
      }

      // Verify old password
      const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
      if (!isPasswordValid) {
        throw new Error("Current password is incorrect");
      }

      // Hash and save new password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      await user.update({ password: hashedPassword });

      return {
        success: true,
        message: "Password changed successfully",
      };
    } catch (error) {
      console.error("Error changing password:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to change password",
      };
    }
  }

  /**
   * Reset user password (admin function)
   * @param {number} id - User ID
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Result
   */
  async resetPassword(id, newPassword) {
    try {
      if (!id) {
        throw new Error("User ID is required");
      }
      if (!newPassword) {
        throw new Error("New password is required");
      }

      const user = await User.findByPk(id);
      if (!user) {
        throw new Error("User not found");
      }

      // Hash and save new password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      await user.update({ password: hashedPassword });

      return {
        success: true,
        message: "Password reset successfully",
      };
    } catch (error) {
      console.error("Error resetting password:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to reset password",
      };
    }
  }

  /**
   * Get active users
   * @returns {Promise<Object>} Active users
   */
  async getActiveUsers() {
    try {
      const users = await User.findAll({
        where: { status: "active" },
        attributes: { exclude: ["password"] },
        order: [["fullName", "ASC"]],
      });

      return {
        success: true,
        data: users.map((user) => user.toJSON()),
        count: users.length,
      };
    } catch (error) {
      console.error("Error fetching active users:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to fetch active users",
      };
    }
  }

  /**
   * Get admins
   * @returns {Promise<Object>} Admins
   */
  async getAdmins() {
    try {
      const admins = await User.findAll({
        where: {
          role: "admin",
          status: "active",
        },
        attributes: { exclude: ["password"] },
        order: [["fullName", "ASC"]],
      });

      return {
        success: true,
        data: admins.map((admin) => admin.toJSON()),
        count: admins.length,
      };
    } catch (error) {
      console.error("Error fetching admins:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to fetch admins",
      };
    }
  }

  /**
   * Deactivate a user
   * @param {number} id - User ID
   * @returns {Promise<Object>} Result
   */
  async deactivateUser(id) {
    try {
      return await this.updateUser(id, { status: "inactive" });
    } catch (error) {
      console.error("Error deactivating user:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to deactivate user",
      };
    }
  }

  /**
   * Activate a user
   * @param {number} id - User ID
   * @returns {Promise<Object>} Result
   */
  async activateUser(id) {
    try {
      return await this.updateUser(id, { status: "active" });
    } catch (error) {
      console.error("Error activating user:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to activate user",
      };
    }
  }
}

export default new UserService();
