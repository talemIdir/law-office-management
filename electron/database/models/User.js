import { DataTypes } from "sequelize";
import { sequelize } from "../config.js";

// User Model - نموذج المستخدم
const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      comment: "اسم المستخدم",
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "كلمة المرور",
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "الاسم الكامل",
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      comment: "البريد الإلكتروني",
    },
    role: {
      type: DataTypes.ENUM("admin", "lawyer", "assistant"),
      defaultValue: "assistant",
      comment: "الدور",
    },
    phone: {
      type: DataTypes.STRING,
      comment: "رقم الهاتف",
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      defaultValue: "active",
      comment: "الحالة",
    },
  },
  {
    timestamps: true,
    tableName: "users",
  },
);

export default User;
